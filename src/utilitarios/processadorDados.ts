import {
  DataFrame,
  Field,
  FieldType,
  formattedValueToString,
  getFieldDisplayName,
  PanelData,
} from '@grafana/data';
import {
  AnyDeviceMetricType,
  BlockOverrideConfig,
  ChartType,
  DeviceType,
  MetricBlockItem,
  MetricCategory,
  MetricDataPoint,
  MetricStatusLevel,
  MetricStyleOverride,
  MonitoredDeviceItem,
  PanelOptions,
  StandardUnitType,
} from '../types';
import {
  formatarBandaRede,
  formatarBytes,
  formatarLatenciaMs,
  formatarPorUnidadePadrao,
  formatarUptime,
} from './formatadores';
import { avaliarLivrePercentual, avaliarUsoPercentual } from './avaliadores';
import {
  detectarSubTipoMetricaPorTexto,
  estaEmModoMultiplasMetricas,
  estaEmModoMultiplosDispositivos,
  obterQuantidadeDispositivos,
  METADADOS_DISPOSITIVOS,
  obterDispositivoAtivo,
  obterMetricasDisponiveisParaDispositivo,
  obterSubTipoAtivo,
  PRECONFIGURACOES_METRICAS,
  ROTULOS_SUBTIPOS,
} from './subtipos';
import { resolverOpcoesVisuais } from './resolucaoOpcoes';

// Re-exporta helpers
export * from './formatadores';
export * from './avaliadores';
export * from './subtipos';

/**
 * Calcula percentual normalizado (0 a 100) dado um valor e limites min/max
 */
function calcularPercentualEscala(valor: number, min: number, max: number): number {
  const intervalo = max - min || 100;
  const pct = ((valor - min) / intervalo) * 100;
  return Math.max(0, Math.min(100, pct));
}

interface SerieExtraidaBruta {
  refId: string;
  seriesName: string;
  campo: Field;
  nomeExibicaoBruto: string;
  hostExtraido?: string;
  metricaExtraida: string;
  unidadeCampoGrafana: string;
  pontos: MetricDataPoint[];
  ultimoValor: number | string | null;
}

/**
 * Separa de forma inteligente o nome do Host/Dispositivo e o nome da Métrica
 * a partir dos metadados da série do Zabbix/Grafana.
 */
function extrairHostEMetricaDaSerie(
  series: DataFrame,
  campo: Field,
  todasSeries: DataFrame[]
): {
  nomeExibicaoBruto: string;
  hostExtraido?: string;
  metricaExtraida: string;
} {
  const nomeExibicaoBruto =
    campo.config.displayName ||
    getFieldDisplayName(campo, series, todasSeries) ||
    campo.name;

  const hostLabel =
    campo.labels?.host ||
    campo.labels?.hostname ||
    campo.labels?.device ||
    campo.labels?.instance ||
    campo.labels?.server ||
    campo.labels?.['host.name'];

  const itemLabel =
    campo.labels?.item ||
    campo.labels?.metric ||
    campo.labels?.['item.name'];

  if (hostLabel) {
    return {
      nomeExibicaoBruto,
      hostExtraido: String(hostLabel).trim(),
      metricaExtraida: itemLabel ? String(itemLabel).trim() : nomeExibicaoBruto,
    };
  }

  // Padrão clássico do Zabbix: "NOME-DO-HOST: Nome do Item"
  if (nomeExibicaoBruto.includes(': ')) {
    const partes = nomeExibicaoBruto.split(': ');
    const possivelHost = partes[0].trim();
    const possivelMetrica = partes.slice(1).join(': ').trim();
    if (possivelHost && possivelMetrica) {
      return {
        nomeExibicaoBruto,
        hostExtraido: possivelHost,
        metricaExtraida: possivelMetrica,
      };
    }
  }

  // Padrão alternativo: "NOME-DO-HOST - Nome do Item"
  if (nomeExibicaoBruto.includes(' - ')) {
    const partes = nomeExibicaoBruto.split(' - ');
    const possivelHost = partes[0].trim();
    const possivelMetrica = partes.slice(1).join(' - ').trim();
    if (possivelHost && possivelMetrica) {
      return {
        nomeExibicaoBruto,
        hostExtraido: possivelHost,
        metricaExtraida: possivelMetrica,
      };
    }
  }

  // Quando series.name traz o Host e campo.name traz a Métrica
  if (
    series.name &&
    campo.name &&
    campo.name.toLowerCase() !== 'value' &&
    series.name !== campo.name
  ) {
    return {
      nomeExibicaoBruto,
      hostExtraido: series.name.trim(),
      metricaExtraida: campo.name.trim(),
    };
  }

  return {
    nomeExibicaoBruto,
    hostExtraido: undefined,
    metricaExtraida: nomeExibicaoBruto,
  };
}

/**
 * Coleta todas as séries numéricas/texto dos DataFrames do Grafana
 */
function coletarSeriesBrutas(dados: PanelData): SerieExtraidaBruta[] {
  const resultado: SerieExtraidaBruta[] = [];
  for (const series of dados.series) {
    const campoTempo = series.fields.find((f) => f.type === FieldType.time);
    const camposValor = series.fields.filter(
      (f) => f.type === FieldType.number || f.type === FieldType.string
    );

    for (const campo of camposValor) {
      const { nomeExibicaoBruto, hostExtraido, metricaExtraida } =
        extrairHostEMetricaDaSerie(series, campo, dados.series);
      const unidadeCampoGrafana = campo.config.unit || '';

      const pontos: MetricDataPoint[] = [];
      let ultimoValor: number | string | null = null;

      const totalPontos = campo.values.length;
      for (let i = 0; i < totalPontos; i++) {
        const val = campo.values[i];
        const tempo = campoTempo ? campoTempo.values[i] : undefined;

        if (val !== undefined && val !== null && val !== '') {
          ultimoValor = val;
        }

        pontos.push({
          time: tempo,
          value: val ?? null,
        });
      }

      resultado.push({
        refId: series.refId || '',
        seriesName: series.name || '',
        campo,
        nomeExibicaoBruto,
        hostExtraido,
        metricaExtraida,
        unidadeCampoGrafana,
        pontos,
        ultimoValor,
      });
    }
  }
  return resultado;
}

/**
 * Constrói um MetricBlockItem aplicando:
 * - Estilo Individual da Métrica (metricStyles)
 * - Sobrescrita do Dispositivo Monitorado (monitoredDevicesConfig)
 * - Standard Options globais
 * - Pré-configuração da Métrica do Dispositivo
 * - Detecção inteligente por categoria
 */
function construirItemBlocoMetrica(params: {
  serie: SerieExtraidaBruta;
  indice: number;
  dispositivoAtivo: DeviceType;
  subTipoEfetivo: AnyDeviceMetricType | null;
  opcoesEfetivas: Partial<PanelOptions>;
  stdGlobal: {
    unit?: StandardUnitType;
    decimalsAuto: boolean;
    customDecimals?: number;
    displayName?: string;
    prefix?: string;
    suffix?: string;
    min?: number;
    max?: number;
    noValue: string;
    linkUrl?: string;
    linkTargetBlank?: boolean;
  };
  dispositivoItem?: MonitoredDeviceItem;
  nomeDispositivoExplicito?: string;
  multiplasMetricasAtivas: boolean;
}): MetricBlockItem {
  const {
    serie,
    indice,
    dispositivoAtivo,
    subTipoEfetivo,
    opcoesEfetivas,
    stdGlobal,
    dispositivoItem,
    nomeDispositivoExplicito,
    multiplasMetricasAtivas,
  } = params;

  const {
    campo,
    nomeExibicaoBruto,
    metricaExtraida,
    unidadeCampoGrafana,
    pontos,
    ultimoValor,
  } = serie;

  const preconfig = subTipoEfetivo ? PRECONFIGURACOES_METRICAS[subTipoEfetivo] : undefined;
  const infoDispositivo = METADADOS_DISPOSITIVOS[dispositivoAtivo];

  // Busca override específico por bloco (índice 1-based, ex: "3", ou pelo nome do host)
  const indice1Based = String(indice + 1);
  const overrideBloco: BlockOverrideConfig | undefined =
    (opcoesEfetivas.blockOverrides && opcoesEfetivas.blockOverrides[indice1Based]) ||
    (serie.hostExtraido && opcoesEfetivas.blockOverrides?.[serie.hostExtraido]) ||
    opcoesEfetivas.blockOverrides?.[serie.nomeExibicaoBruto];

  // Busca estilo individual configurado para esta métrica (se houver)
  const chaveEstilo = subTipoEfetivo || metricaExtraida || nomeExibicaoBruto;
  const estiloIndividual: MetricStyleOverride | undefined =
    (subTipoEfetivo && opcoesEfetivas.metricStyles?.[subTipoEfetivo]) ||
    opcoesEfetivas.metricStyles?.[chaveEstilo] ||
    opcoesEfetivas.metricStyles?.[nomeExibicaoBruto];

  const textoSemValor = overrideBloco?.noValue ?? stdGlobal.noValue;

  const valorNumerico =
    typeof ultimoValor === 'number' ? ultimoValor : Number(ultimoValor);
  const ehNumero = !isNaN(valorNumerico) && ultimoValor !== null && ultimoValor !== '';

  // 1. Unidade Efetiva (Prioridade: Override do Bloco > Estilo Individual > Pré-configuração da Métrica > Standard Options Global)
  const unidadeEfetiva: Exclude<StandardUnitType, 'auto'> | null =
    overrideBloco?.unit && overrideBloco.unit !== 'auto'
      ? overrideBloco.unit
      : estiloIndividual?.unit && estiloIndividual.unit !== 'auto'
      ? estiloIndividual.unit
      : !multiplasMetricasAtivas && stdGlobal.unit && stdGlobal.unit !== 'auto'
      ? stdGlobal.unit
      : preconfig?.unidadePadrao ||
        (stdGlobal.unit && stdGlobal.unit !== 'auto' ? stdGlobal.unit : null);

  // 2. Casas Decimais Efetivas
  let decimaisEfetivos: number | null = 1;
  const usarDecimaisAuto =
    overrideBloco?.decimalsAuto !== undefined
      ? overrideBloco.decimalsAuto
      : estiloIndividual?.decimalsAuto !== undefined
      ? estiloIndividual.decimalsAuto
      : multiplasMetricasAtivas
      ? true
      : stdGlobal.decimalsAuto;
  const decimaisManuais =
    overrideBloco?.decimalsAuto === false
      ? overrideBloco.customDecimals
      : estiloIndividual?.decimalsAuto === false
      ? estiloIndividual.customDecimals
      : stdGlobal.customDecimals;

  if (usarDecimaisAuto !== false) {
    decimaisEfetivos =
      campo.config.decimals !== undefined && campo.config.decimals !== null
        ? campo.config.decimals
        : preconfig?.decimais ?? 1;
  } else {
    if (
      decimaisManuais === undefined ||
      decimaisManuais === null ||
      isNaN(Number(decimaisManuais)) ||
      Number(decimaisManuais) === 0
    ) {
      decimaisEfetivos = null;
    } else {
      decimaisEfetivos = Math.max(0, Math.floor(Number(decimaisManuais)));
    }
  }

  // 3. Limites Mín e Máx da Escala
  const minEfetivo: number =
    overrideBloco?.min !== undefined && !isNaN(Number(overrideBloco.min))
      ? Number(overrideBloco.min)
      : estiloIndividual?.min !== undefined && !isNaN(Number(estiloIndividual.min))
      ? Number(estiloIndividual.min)
      : !multiplasMetricasAtivas &&
        stdGlobal.min !== undefined &&
        stdGlobal.min !== null &&
        !isNaN(Number(stdGlobal.min))
      ? Number(stdGlobal.min)
      : campo.config.min !== undefined && campo.config.min !== null
      ? campo.config.min
      : preconfig?.minimo ?? 0;

  const maxEfetivo: number =
    overrideBloco?.max !== undefined && !isNaN(Number(overrideBloco.max))
      ? Number(overrideBloco.max)
      : estiloIndividual?.max !== undefined && !isNaN(Number(estiloIndividual.max))
      ? Number(estiloIndividual.max)
      : !multiplasMetricasAtivas &&
        stdGlobal.max !== undefined &&
        stdGlobal.max !== null &&
        !isNaN(Number(stdGlobal.max))
      ? Number(stdGlobal.max)
      : campo.config.max !== undefined && campo.config.max !== null
      ? campo.config.max
      : preconfig?.maximo ?? 100;

  // 4. Limiares (Thresholds)
  const limiarAtencao =
    overrideBloco?.thresholdWarning !== undefined &&
    !isNaN(Number(overrideBloco.thresholdWarning))
      ? Number(overrideBloco.thresholdWarning)
      : estiloIndividual?.thresholdWarning !== undefined &&
        !isNaN(Number(estiloIndividual.thresholdWarning))
      ? Number(estiloIndividual.thresholdWarning)
      : !multiplasMetricasAtivas &&
        opcoesEfetivas.thresholdWarning !== undefined &&
        !isNaN(Number(opcoesEfetivas.thresholdWarning))
      ? Number(opcoesEfetivas.thresholdWarning)
      : preconfig?.limiarAtencao ?? opcoesEfetivas.thresholdWarning ?? 70;

  const limiarCritico =
    overrideBloco?.thresholdCritical !== undefined &&
    !isNaN(Number(overrideBloco.thresholdCritical))
      ? Number(overrideBloco.thresholdCritical)
      : estiloIndividual?.thresholdCritical !== undefined &&
        !isNaN(Number(estiloIndividual.thresholdCritical))
      ? Number(estiloIndividual.thresholdCritical)
      : !multiplasMetricasAtivas &&
        opcoesEfetivas.thresholdCritical !== undefined &&
        !isNaN(Number(opcoesEfetivas.thresholdCritical))
      ? Number(opcoesEfetivas.thresholdCritical)
      : preconfig?.limiarCritico ?? opcoesEfetivas.thresholdCritical ?? 85;

  const modoLimiarEfetivo: 'normal' | 'invertido' | 'fixo' =
    overrideBloco?.thresholdMode && overrideBloco.thresholdMode !== 'auto'
      ? overrideBloco.thresholdMode
      : estiloIndividual?.thresholdMode && estiloIndividual.thresholdMode !== 'auto'
      ? estiloIndividual.thresholdMode
      : !multiplasMetricasAtivas &&
        opcoesEfetivas.thresholdMode &&
        opcoesEfetivas.thresholdMode !== 'auto'
      ? opcoesEfetivas.thresholdMode
      : preconfig?.modoLimiar ?? 'normal';

  const corFixaBase =
    overrideBloco?.fixedMetricColor ||
    estiloIndividual?.fixedMetricColor ||
    dispositivoItem?.customColor ||
    opcoesEfetivas.fixedMetricColor;

  let categoria: MetricCategory = preconfig?.categoria || 'generic';
  let nivelStatus: MetricStatusLevel = 'info';
  let tagStatus: string | undefined = undefined;
  let subTexto: string | undefined = preconfig?.subTextoPadrao;
  let corStatus = corFixaBase || infoDispositivo.corDestaque || '#3b82f6';
  let percentual: number | undefined = undefined;
  let valorExibicao = textoSemValor;
  let icone: string | undefined = preconfig?.icone;

  const nomeMinusculo = nomeExibicaoBruto.toLowerCase();

  // =========================================================================
  // MODO A: PRECONFIGURAÇÃO DE DISPOSITIVO OU UNIDADE STANDARD DEFINIDA
  // =========================================================================
  if (unidadeEfetiva) {
    valorExibicao = formatarPorUnidadePadrao(
      ultimoValor,
      unidadeEfetiva,
      decimaisEfetivos,
      textoSemValor
    );

    if (ehNumero) {
      if (
        unidadeEfetiva === 'status' ||
        unidadeEfetiva === 'status_vm' ||
        unidadeEfetiva === 'status_porta'
      ) {
        categoria = 'status';
        percentual = valorNumerico >= 1 ? 100 : 0;
        if (valorNumerico >= 1) {
          nivelStatus = 'ok';
          tagStatus =
            unidadeEfetiva === 'status_vm'
              ? 'LIGADA'
              : unidadeEfetiva === 'status_porta'
              ? 'PORTA UP'
              : 'ONLINE';
          corStatus = '#22c55e';
          subTexto = subTexto || 'Equipamento Comunicando Normalmente';
        } else {
          nivelStatus = 'offline';
          tagStatus =
            unidadeEfetiva === 'status_vm'
              ? 'DESLIGADA'
              : unidadeEfetiva === 'status_porta'
              ? 'PORTA DOWN'
              : 'OFFLINE';
          corStatus = '#ef4444';
          subTexto = subTexto || 'Sem Comunicação / Inativo';
        }
      } else if (unidadeEfetiva === 'saude') {
        categoria = 'status';
        if (valorNumerico === 0 || valorNumerico === 1) {
          nivelStatus = 'ok';
          tagStatus = 'SAUDÁVEL';
          corStatus = '#22c55e';
          percentual = 100;
        } else if (valorNumerico === 2) {
          nivelStatus = 'warning';
          tagStatus = 'ATENÇÃO';
          corStatus = '#f59e0b';
          percentual = 50;
        } else {
          nivelStatus = 'critical';
          tagStatus = 'CRÍTICO';
          corStatus = '#ef4444';
          percentual = 15;
        }
      } else if (unidadeEfetiva === 'uptime') {
        categoria = 'uptime';
        nivelStatus = 'ok';
        tagStatus = 'ATIVO';
        corStatus = '#22c55e';
      } else {
        percentual = calcularPercentualEscala(valorNumerico, minEfetivo, maxEfetivo);

        if (modoLimiarEfetivo === 'fixo') {
          nivelStatus = 'ok';
          tagStatus =
            unidadeEfetiva === 'bps'
              ? 'TRÁFEGO'
              : unidadeEfetiva === 'bytes'
              ? 'VOLUME'
              : 'ATIVO';
          corStatus = corFixaBase || infoDispositivo.corDestaque || '#38bdf8';
        } else if (modoLimiarEfetivo === 'invertido') {
          const res = avaliarLivrePercentual(
            valorNumerico,
            limiarAtencao,
            limiarCritico,
            subTexto || 'Operação Normal'
          );
          nivelStatus = res.nivelStatus;
          tagStatus = res.tagStatus;
          subTexto = preconfig?.subTextoPadrao || res.subTexto;
          corStatus = res.corStatus;
        } else {
          if (valorNumerico < limiarAtencao) {
            nivelStatus = 'ok';
            tagStatus = 'NORMAL';
            corStatus = '#22c55e';
            subTexto = subTexto || `Operação Saudável (< ${limiarAtencao})`;
          } else if (valorNumerico < limiarCritico) {
            nivelStatus = 'warning';
            tagStatus = 'ATENÇÃO';
            corStatus = '#f59e0b';
            subTexto = subTexto || `Acima do Limiar de Atenção (${limiarAtencao})`;
          } else {
            nivelStatus = 'critical';
            tagStatus = 'CRÍTICO';
            corStatus = '#ef4444';
            subTexto = subTexto || `Limiar Crítico Ultrapassado (> ${limiarCritico})`;
          }
        }
      }
    }
  }
  // =========================================================================
  // MODO B: DETECÇÃO AUTOMÁTICA INTELIGENTE PELO NOME DA QUERY ZABBIX
  // =========================================================================
  else {
    if (
      (nomeMinusculo.includes('ping') ||
        nomeMinusculo.includes('agent') ||
        nomeMinusculo.includes('power state') ||
        nomeMinusculo.includes('status')) &&
      ehNumero &&
      (valorNumerico === 0 || valorNumerico === 1)
    ) {
      categoria = 'status';
      percentual = valorNumerico >= 1 ? 100 : 0;
      if (valorNumerico >= 1) {
        nivelStatus = 'ok';
        tagStatus = 'ONLINE';
        subTexto = 'Dispositivo Respondendo (100%)';
        corStatus = '#22c55e';
        valorExibicao = 'ONLINE';
      } else {
        nivelStatus = 'offline';
        tagStatus = 'OFFLINE';
        subTexto = 'Sem Resposta do Dispositivo';
        corStatus = '#ef4444';
        valorExibicao = 'OFFLINE';
      }
    } else if (nomeMinusculo.includes('uptime') && ehNumero) {
      categoria = 'uptime';
      nivelStatus = 'ok';
      tagStatus = 'ATIVO';
      subTexto = 'Tempo de Atividade';
      corStatus = '#22c55e';
      valorExibicao = formatarUptime(valorNumerico);
    } else if (
      ehNumero &&
      (nomeMinusculo.includes('free') || nomeMinusculo.includes('livre')) &&
      (unidadeCampoGrafana === '%' || nomeMinusculo.includes('%') || valorNumerico <= 100) &&
      valorNumerico >= 0 &&
      valorNumerico <= 100
    ) {
      categoria = 'disk';
      const res = avaliarLivrePercentual(valorNumerico, limiarAtencao, limiarCritico);
      percentual = res.percentual;
      valorExibicao =
        decimaisEfetivos !== null
          ? `${valorNumerico.toFixed(decimaisEfetivos)}%`
          : `${valorNumerico}%`;
      nivelStatus = res.nivelStatus;
      tagStatus = res.tagStatus;
      subTexto = res.subTexto;
      corStatus = res.corStatus;
    } else if (
      ehNumero &&
      (unidadeCampoGrafana === '%' ||
        nomeMinusculo.includes('%') ||
        nomeMinusculo.includes('utilization') ||
        nomeMinusculo.includes('usage') ||
        nomeMinusculo.includes('uso') ||
        nomeMinusculo.includes('cpu') ||
        nomeMinusculo.includes('disco') ||
        nomeMinusculo.includes('datastore')) &&
      valorNumerico <= 100 &&
      valorNumerico >= 0
    ) {
      categoria = 'percentage';
      const res = avaliarUsoPercentual(valorNumerico, limiarAtencao, limiarCritico);
      percentual = res.percentual;
      valorExibicao =
        decimaisEfetivos !== null
          ? `${valorNumerico.toFixed(decimaisEfetivos)}%`
          : `${valorNumerico}%`;
      nivelStatus = res.nivelStatus;
      tagStatus = res.tagStatus;
      subTexto = res.subTexto;
      corStatus = res.corStatus;
    } else if (
      ehNumero &&
      (nomeMinusculo.includes('bps') ||
        nomeMinusculo.includes('traffic') ||
        nomeMinusculo.includes('tráfego') ||
        nomeMinusculo.includes('bits'))
    ) {
      categoria = 'traffic';
      nivelStatus = 'ok';
      tagStatus = 'REDE';
      subTexto = 'Taxa de Transferência';
      corStatus = '#38bdf8';
      valorExibicao = formatarBandaRede(valorNumerico, decimaisEfetivos ?? 2);
      percentual = calcularPercentualEscala(valorNumerico, minEfetivo, maxEfetivo);
    } else if (
      ehNumero &&
      (nomeMinusculo.includes('latency') ||
        nomeMinusculo.includes('latência') ||
        nomeMinusculo.includes('response time') ||
        unidadeCampoGrafana === 'ms' ||
        unidadeCampoGrafana === 's')
    ) {
      categoria = 'latency';
      const { ms, texto } = formatarLatenciaMs(valorNumerico, decimaisEfetivos ?? 1);
      valorExibicao = texto;
      percentual = calcularPercentualEscala(ms, 0, 200);
      if (ms < 50) {
        nivelStatus = 'ok';
        tagStatus = 'ESTÁVEL';
        corStatus = '#22c55e';
        subTexto = 'Tempo de Resposta Ideal';
      } else if (ms < 150) {
        nivelStatus = 'warning';
        tagStatus = 'MODERADO';
        corStatus = '#f59e0b';
        subTexto = 'Latência Moderada';
      } else {
        nivelStatus = 'critical';
        tagStatus = 'ALTA';
        corStatus = '#ef4444';
        subTexto = 'Latência Elevada';
      }
    } else if (
      ehNumero &&
      valorNumerico > 100 &&
      (nomeMinusculo.includes('memory') ||
        nomeMinusculo.includes('ram') ||
        nomeMinusculo.includes('disk') ||
        nomeMinusculo.includes('disco') ||
        nomeMinusculo.includes('space') ||
        nomeMinusculo.includes('bytes'))
    ) {
      categoria = 'bytes';
      nivelStatus = 'ok';
      tagStatus =
        nomeMinusculo.includes('free') || nomeMinusculo.includes('livre')
          ? 'LIVRE'
          : 'VOLUME';
      subTexto = 'Capacidade / Armazenamento';
      corStatus = '#818cf8';
      valorExibicao = formatarBytes(valorNumerico, decimaisEfetivos ?? 1);
      percentual = 65;
    } else {
      categoria = 'generic';
      if (campo.display && ultimoValor !== null) {
        valorExibicao = formattedValueToString(campo.display(ultimoValor));
      } else if (ehNumero) {
        valorExibicao = valorNumerico.toLocaleString(undefined, {
          maximumFractionDigits: decimaisEfetivos !== null ? decimaisEfetivos : 20,
        });
        if (unidadeCampoGrafana) {
          valorExibicao += ` ${unidadeCampoGrafana}`;
        }
        percentual = calcularPercentualEscala(valorNumerico, minEfetivo, maxEfetivo);
      } else if (ultimoValor !== null && ultimoValor !== undefined) {
        valorExibicao = String(ultimoValor);
      }
      corStatus =
        corFixaBase ||
        campo.config.color?.fixedColor ||
        infoDispositivo.corDestaque ||
        '#6366f1';
    }
  }

  // 5. Resolução do Tipo de Gráfico
  // Prioridade: Override do Bloco > Override do Dispositivo > Estilo Individual da Métrica > Pré-configuração > Seleção Global > Auto
  let graficoResolvido: Exclude<ChartType, 'auto'> = 'barra';
  if (overrideBloco?.chartType && overrideBloco.chartType !== 'auto') {
    graficoResolvido = overrideBloco.chartType;
  } else if (dispositivoItem?.chartTypeOverride && dispositivoItem.chartTypeOverride !== 'auto') {
    graficoResolvido = dispositivoItem.chartTypeOverride;
  } else if (estiloIndividual?.chartType && estiloIndividual.chartType !== 'auto') {
    graficoResolvido = estiloIndividual.chartType;
  } else if (!multiplasMetricasAtivas && opcoesEfetivas.chartType && opcoesEfetivas.chartType !== 'auto') {
    graficoResolvido = opcoesEfetivas.chartType;
  } else if (preconfig?.graficoPadrao) {
    graficoResolvido = preconfig.graficoPadrao;
  } else if (opcoesEfetivas.chartType && opcoesEfetivas.chartType !== 'auto') {
    graficoResolvido = opcoesEfetivas.chartType;
  } else if (categoria === 'percentage' || categoria === 'disk') {
    graficoResolvido = 'barra';
  } else if (categoria === 'status' || categoria === 'uptime') {
    graficoResolvido = 'nenhum';
  } else {
    graficoResolvido = 'area';
  }

  if (
    percentual === undefined &&
    ehNumero &&
    (graficoResolvido === 'barra' ||
      graficoResolvido === 'circulo' ||
      graficoResolvido === 'arco' ||
      graficoResolvido === 'anel' ||
      graficoResolvido === 'torre' ||
      graficoResolvido === 'bullet' ||
      graficoResolvido === 'termometro')
  ) {
    percentual = calcularPercentualEscala(valorNumerico, minEfetivo, maxEfetivo);
  }

  // 6. Resolução do Rótulo da Métrica e Nome do Dispositivo
  let rotuloMetrica = metricaExtraida || nomeExibicaoBruto;
  if (overrideBloco?.displayName && overrideBloco.displayName.trim() !== '') {
    rotuloMetrica = overrideBloco.displayName.trim();
  } else if (estiloIndividual?.displayName && estiloIndividual.displayName.trim() !== '') {
    rotuloMetrica = estiloIndividual.displayName.trim();
  } else if (!multiplasMetricasAtivas && stdGlobal.displayName && stdGlobal.displayName.trim() !== '') {
    rotuloMetrica = stdGlobal.displayName.trim();
  } else if (
    subTipoEfetivo &&
    (multiplasMetricasAtivas || opcoesEfetivas.overrideCardTitleWithPreset !== false) &&
    ROTULOS_SUBTIPOS[subTipoEfetivo]
  ) {
    rotuloMetrica = ROTULOS_SUBTIPOS[subTipoEfetivo];
  }

  const tituloFinal = rotuloMetrica;

  // 7. Cores personalizadas de limiar (Override do Bloco > Estilo Individual > Global)
  const corOkEfetiva = overrideBloco?.colorOk || estiloIndividual?.colorOk || opcoesEfetivas.colorOk;
  const corWarningEfetiva =
    overrideBloco?.colorWarning || estiloIndividual?.colorWarning || opcoesEfetivas.colorWarning;
  const corCriticalEfetiva =
    overrideBloco?.colorCritical || estiloIndividual?.colorCritical || opcoesEfetivas.colorCritical;

  if (modoLimiarEfetivo === 'fixo') {
    corStatus = corFixaBase || corStatus;
  } else if (nivelStatus === 'ok' && corOkEfetiva) {
    corStatus = corOkEfetiva;
  } else if (nivelStatus === 'warning' && corWarningEfetiva) {
    corStatus = corWarningEfetiva;
  } else if ((nivelStatus === 'critical' || nivelStatus === 'offline') && corCriticalEfetiva) {
    corStatus = corCriticalEfetiva;
  }

  // 8. Prefixo e Sufixo (Override do Bloco > Estilo Individual > Global)
  const prefixoEfetivo =
    overrideBloco?.prefix !== undefined
      ? overrideBloco.prefix
      : estiloIndividual?.prefix !== undefined
      ? estiloIndividual.prefix
      : stdGlobal.prefix;
  const sufixoEfetivo =
    overrideBloco?.suffix !== undefined
      ? overrideBloco.suffix
      : estiloIndividual?.suffix !== undefined
      ? estiloIndividual.suffix
      : stdGlobal.suffix;

  if (valorExibicao !== textoSemValor) {
    if (prefixoEfetivo) {
      valorExibicao = `${prefixoEfetivo}${valorExibicao}`;
    }
    if (sufixoEfetivo) {
      valorExibicao = `${valorExibicao}${sufixoEfetivo}`;
    }
  }

  const corGraficoIndividual =
    overrideBloco?.sparklineColor ||
    estiloIndividual?.sparklineColor ||
    dispositivoItem?.customColor ||
    undefined;

  const exibirBadgeIndividual =
    overrideBloco?.showStatusBadge !== undefined
      ? overrideBloco.showStatusBadge
      : estiloIndividual?.showStatusBadge !== undefined
      ? estiloIndividual.showStatusBadge
      : undefined;

  // 9. Link de Redirecionamento (Override do Bloco > Estilo Individual > Standard Options)
  const linkUrlBruta =
    overrideBloco?.linkUrl !== undefined
      ? overrideBloco.linkUrl
      : estiloIndividual?.linkUrl !== undefined
      ? estiloIndividual.linkUrl
      : stdGlobal.linkUrl;

  const linkTargetBlank =
    overrideBloco?.linkTargetBlank !== undefined
      ? overrideBloco.linkTargetBlank
      : estiloIndividual?.linkTargetBlank !== undefined
      ? estiloIndividual.linkTargetBlank
      : stdGlobal.linkTargetBlank !== false;

  let linkUrlResolvido: string | undefined = undefined;
  if (linkUrlBruta && linkUrlBruta.trim() !== '') {
    const nomeDisp =
      nomeDispositivoExplicito || serie.hostExtraido || opcoesEfetivas.deviceName || '';
    linkUrlResolvido = linkUrlBruta
      .trim()
      .replace(/\${host}/gi, nomeDisp)
      .replace(/\$host/gi, nomeDisp)
      .replace(/\${deviceName}/gi, nomeDisp)
      .replace(/\${device}/gi, nomeDisp)
      .replace(/\${metricName}/gi, serie.metricaExtraida || '')
      .replace(/\${metric}/gi, serie.metricaExtraida || '')
      .replace(/\${title}/gi, serie.nomeExibicaoBruto || '');
  }

  return {
    id: `${serie.refId}_${campo.name}_${nomeDispositivoExplicito || serie.seriesName}_${subTipoEfetivo || ''}_${indice}`,
    title: tituloFinal,
    deviceName: nomeDispositivoExplicito,
    metricName: rotuloMetrica,
    metricKey: subTipoEfetivo || chaveEstilo,
    currentValue: ultimoValor,
    displayValue: valorExibicao,
    unit: unidadeEfetiva || unidadeCampoGrafana,
    points: pontos,
    sparklineColor: corGraficoIndividual,
    thresholdWarning: limiarAtencao,
    thresholdCritical: limiarCritico,
    showStatusBadge: exibirBadgeIndividual,
    category: categoria,
    statusLevel: nivelStatus,
    statusBadge: tagStatus,
    subText: subTexto,
    percentage: percentual,
    statusColor: corStatus,
    icon: icone,
    deviceType: dispositivoAtivo,
    chartType: graficoResolvido,
    linkUrl: linkUrlResolvido,
    linkTargetBlank,
  };
}

/**
 * Localiza a melhor série para uma métrica específica dentro de um conjunto de séries
 */
function localizarSerieParaMetrica(
  seriesCandidatas: SerieExtraidaBruta[],
  metricaAlvo: AnyDeviceMetricType,
  dispositivoAtivo: DeviceType,
  metricStyles?: Record<string, MetricStyleOverride>,
  indiceFallback = 0
): SerieExtraidaBruta {
  const filtroCustom = metricStyles?.[metricaAlvo]?.seriesFilter?.trim().toLowerCase();
  if (filtroCustom) {
    const porFiltro = seriesCandidatas.find(
      (s) =>
        s.refId.toLowerCase() === filtroCustom ||
        s.nomeExibicaoBruto.toLowerCase().includes(filtroCustom) ||
        s.metricaExtraida.toLowerCase().includes(filtroCustom) ||
        s.seriesName.toLowerCase().includes(filtroCustom)
    );
    if (porFiltro) {
      return porFiltro;
    }
  }

  const porPalavraChave = seriesCandidatas.find(
    (s) =>
      detectarSubTipoMetricaPorTexto(
        `${s.metricaExtraida} ${s.nomeExibicaoBruto}`,
        dispositivoAtivo,
        [metricaAlvo]
      ) === metricaAlvo
  );
  if (porPalavraChave) {
    return porPalavraChave;
  }

  return seriesCandidatas[indiceFallback % seriesCandidatas.length];
}

/**
 * Extrai e estrutura os dados das queries do Zabbix, combinando:
 * 1) Pré-configurações do Dispositivo e Métrica(s) selecionada(s)
 * 2) Múltiplas métricas selecionadas e estilização individual por métrica
 * 3) Múltiplos dispositivos configurados no card (ex: 10+ servidores) ou detectados na query
 * 4) Sobrescritas do Standard Options
 */
export function extrairMetricasDosDados(
  dados: PanelData,
  opcoes?: Partial<PanelOptions>
): MetricBlockItem[] {
  if (!dados || !dados.series || dados.series.length === 0) {
    return [];
  }

  const seriesBrutas = coletarSeriesBrutas(dados);
  if (seriesBrutas.length === 0) {
    return [];
  }

  const opcoesVisuais = resolverOpcoesVisuais(opcoes);
  const opcoesEfetivas: Partial<PanelOptions> = {
    ...opcoes,
    ...opcoesVisuais,
  };

  const dispositivoAtivo = obterDispositivoAtivo(opcoesEfetivas);
  const subTipoUnico = obterSubTipoAtivo(opcoesEfetivas);
  const emModoMultiplasMetricas = estaEmModoMultiplasMetricas(opcoesEfetivas);

  const metricasSelecionadas: AnyDeviceMetricType[] =
    emModoMultiplasMetricas &&
    Array.isArray(opcoesEfetivas.selectedMetrics) &&
    opcoesEfetivas.selectedMetrics.length > 0
      ? opcoesEfetivas.selectedMetrics.filter((m) => m !== 'auto_device')
      : [];

  const stdGlobal = {
    unit: opcoesEfetivas.standardOptions?.unit ?? opcoesEfetivas.standardUnit,
    decimalsAuto:
      opcoesEfetivas.standardOptions?.decimalsAuto !== undefined
        ? opcoesEfetivas.standardOptions.decimalsAuto
        : opcoesEfetivas.decimalsAuto !== false,
    customDecimals:
      opcoesEfetivas.standardOptions?.customDecimals !== undefined
        ? opcoesEfetivas.standardOptions.customDecimals
        : opcoesEfetivas.customDecimals,
    displayName:
      opcoesEfetivas.standardOptions?.displayName !== undefined
        ? opcoesEfetivas.standardOptions.displayName
        : opcoesEfetivas.standardDisplayName,
    prefix:
      opcoesEfetivas.standardOptions?.prefix !== undefined
        ? opcoesEfetivas.standardOptions.prefix
        : opcoesEfetivas.standardPrefix,
    suffix:
      opcoesEfetivas.standardOptions?.suffix !== undefined
        ? opcoesEfetivas.standardOptions.suffix
        : opcoesEfetivas.standardSuffix,
    min:
      opcoesEfetivas.standardOptions?.min !== undefined
        ? opcoesEfetivas.standardOptions.min
        : opcoesEfetivas.standardMin,
    max:
      opcoesEfetivas.standardOptions?.max !== undefined
        ? opcoesEfetivas.standardOptions.max
        : opcoesEfetivas.standardMax,
    noValue:
      opcoesEfetivas.standardOptions?.noValue !== undefined
        ? opcoesEfetivas.standardOptions.noValue
        : opcoesEfetivas.standardNoValue || '-',
    linkUrl: opcoesEfetivas.standardOptions?.linkUrl,
    linkTargetBlank: opcoesEfetivas.standardOptions?.linkTargetBlank,
  };

  const dispositivosConfigurados: MonitoredDeviceItem[] = (
    opcoesEfetivas.monitoredDevicesConfig?.devices || []
  ).filter((d) => d.enabled !== false && d.name && d.name.trim() !== '');

  const itens: MetricBlockItem[] = [];

  // =========================================================================
  // CENÁRIO 0: VÁRIOS DISPOSITIVOS NO MESMO CARD (1 ÚNICO TIPO DE MÉTRICA)
  // Ex: Uso de CPU de 10 servidores, exibidos individualmente no mesmo card
  // =========================================================================
  if (estaEmModoMultiplosDispositivos(opcoesEfetivas)) {
    const quantidade = obterQuantidadeDispositivos(opcoesEfetivas);

    // Mantém apenas as séries que correspondem à métrica escolhida (quando identificável)
    let candidatas = seriesBrutas;
    if (subTipoUnico) {
      const casadas = seriesBrutas.filter(
        (s) =>
          detectarSubTipoMetricaPorTexto(
            `${s.metricaExtraida} ${s.nomeExibicaoBruto}`,
            dispositivoAtivo,
            [subTipoUnico]
          ) === subTipoUnico
      );
      if (casadas.length > 0) {
        candidatas = casadas;
      }
    }

    // 1 série por dispositivo (host)
    const hostsVistos = new Set<string>();
    const porDispositivo = candidatas.filter((s) => {
      const chave = (s.hostExtraido || s.nomeExibicaoBruto).toLowerCase();
      if (hostsVistos.has(chave)) {
        return false;
      }
      hostsVistos.add(chave);
      return true;
    });

    if (quantidade > porDispositivo.length && porDispositivo.length > 0) {
      for (let i = 0; i < quantidade; i++) {
        const s = porDispositivo[i % porDispositivo.length];
        const nomeBase =
          opcoesEfetivas.deviceName?.trim() ||
          s.hostExtraido ||
          s.nomeExibicaoBruto ||
          'Dispositivo';
        const nomeHost =
          porDispositivo.length === 1 && quantidade > 1
            ? `${nomeBase} ${String(i + 1).padStart(2, '0')}`
            : s.hostExtraido || s.nomeExibicaoBruto;

        itens.push(
          construirItemBlocoMetrica({
            serie: s,
            indice: itens.length,
            dispositivoAtivo,
            subTipoEfetivo:
              subTipoUnico ||
              detectarSubTipoMetricaPorTexto(
                `${s.metricaExtraida} ${s.nomeExibicaoBruto}`,
                dispositivoAtivo
              ),
            opcoesEfetivas,
            stdGlobal,
            nomeDispositivoExplicito: nomeHost,
            multiplasMetricasAtivas: false,
          })
        );
      }
      return itens;
    }

    const limitadas = quantidade > 0 ? porDispositivo.slice(0, quantidade) : porDispositivo;

    limitadas.forEach((s) => {
      itens.push(
        construirItemBlocoMetrica({
          serie: s,
          indice: itens.length,
          dispositivoAtivo,
          subTipoEfetivo:
            subTipoUnico ||
            detectarSubTipoMetricaPorTexto(
              `${s.metricaExtraida} ${s.nomeExibicaoBruto}`,
              dispositivoAtivo
            ),
          opcoesEfetivas,
          stdGlobal,
          nomeDispositivoExplicito: s.hostExtraido || s.nomeExibicaoBruto,
          multiplasMetricasAtivas: false,
        })
      );
    });

    return itens;
  }

  // =========================================================================
  // CENÁRIO 1: USUÁRIO CADASTROU DISPOSITIVOS MONITORADOS (EX: 10+ SERVIDORES)
  // =========================================================================
  if (dispositivosConfigurados.length > 0) {
    const metricasParaCadaDispositivo: Array<AnyDeviceMetricType | null> =
      metricasSelecionadas.length > 0
        ? metricasSelecionadas
        : emModoMultiplasMetricas
          ? obterMetricasDisponiveisParaDispositivo(dispositivoAtivo).map((m) => m.value)
          : [subTipoUnico];

    dispositivosConfigurados.forEach((disp, dIdx) => {
      const filtroHost = (disp.hostFilter || disp.name).trim().toLowerCase();
      const seriesDoDispositivo = seriesBrutas.filter(
        (s) =>
          (s.hostExtraido && s.hostExtraido.toLowerCase().includes(filtroHost)) ||
          s.nomeExibicaoBruto.toLowerCase().includes(filtroHost) ||
          s.seriesName.toLowerCase().includes(filtroHost) ||
          s.refId.toLowerCase() === filtroHost
      );

      const poolSeries =
        seriesDoDispositivo.length > 0 ? seriesDoDispositivo : seriesBrutas;

      const metricasDesteDispositivo: Array<AnyDeviceMetricType | null> =
        disp.metricOverride
          ? [disp.metricOverride]
          : metricasParaCadaDispositivo;

      metricasDesteDispositivo.forEach((metricaAlvo, mIdx) => {
        const serieEscolhida = metricaAlvo
          ? localizarSerieParaMetrica(
              poolSeries,
              metricaAlvo,
              dispositivoAtivo,
              opcoesEfetivas.metricStyles,
              seriesDoDispositivo.length > 0 ? mIdx : dIdx + mIdx
            )
          : poolSeries[
              (seriesDoDispositivo.length > 0 ? mIdx : dIdx) % poolSeries.length
            ];

        const subTipoResolvido =
          metricaAlvo ||
          detectarSubTipoMetricaPorTexto(
            `${serieEscolhida.metricaExtraida} ${serieEscolhida.nomeExibicaoBruto}`,
            dispositivoAtivo
          );

        itens.push(
          construirItemBlocoMetrica({
            serie: serieEscolhida,
            indice: itens.length,
            dispositivoAtivo,
            subTipoEfetivo: subTipoResolvido,
            opcoesEfetivas,
            stdGlobal,
            dispositivoItem: disp,
            nomeDispositivoExplicito: disp.name.trim(),
            multiplasMetricasAtivas: metricasDesteDispositivo.length > 1 || emModoMultiplasMetricas,
          })
        );
      });
    });

    return itens;
  }

  // =========================================================================
  // CENÁRIO 2: MODO VÁRIAS MÉTRICAS NO MESMO BLOCO (CONSOLIDADO / AUTO_DEVICE)
  // =========================================================================
  if (emModoMultiplasMetricas || metricasSelecionadas.length > 0) {
    const todasMetricasDispositivo = obterMetricasDisponiveisParaDispositivo(
      dispositivoAtivo
    ).map((m) => m.value);

    // Se nenhuma métrica foi filtrada manualmente (Automático / selectedMetrics vazio),
    // usa todas as métricas disponíveis do dispositivo para exibir todas no mesmo bloco
    const metricasAlvo: AnyDeviceMetricType[] =
      metricasSelecionadas.length > 0
        ? metricasSelecionadas
        : todasMetricasDispositivo;

    const nomeDispositivoUnico =
      opcoesEfetivas.deviceName?.trim() ||
      seriesBrutas.find((s) => s.hostExtraido)?.hostExtraido ||
      undefined;

    // Tenta casar cada série bruta com uma das métricas alvo
    const seriesCasadas: Array<{
      serie: SerieExtraidaBruta;
      metrica: AnyDeviceMetricType;
    }> = [];

    for (const s of seriesBrutas) {
      // 1. Verifica filtro customizado no metricStyles
      let metricaEncontrada: AnyDeviceMetricType | null = null;
      for (const m of metricasAlvo) {
        const filtro = opcoesEfetivas.metricStyles?.[m]?.seriesFilter
          ?.trim()
          .toLowerCase();
        if (
          filtro &&
          (s.refId.toLowerCase() === filtro ||
            s.nomeExibicaoBruto.toLowerCase().includes(filtro) ||
            s.metricaExtraida.toLowerCase().includes(filtro))
        ) {
          metricaEncontrada = m;
          break;
        }
      }

      // 2. Verifica por palavras-chave entre as métricas alvo
      if (!metricaEncontrada) {
        metricaEncontrada = detectarSubTipoMetricaPorTexto(
          `${s.metricaExtraida} ${s.nomeExibicaoBruto}`,
          dispositivoAtivo,
          metricasAlvo
        );
      }

      if (metricaEncontrada) {
        seriesCasadas.push({ serie: s, metrica: metricaEncontrada });
      }
    }

    // Verifica quais métricas alvo já foram atendidas pelas séries casadas
    const metricasAtendidas = new Set(seriesCasadas.map((sc) => sc.metrica));

    // Se o usuário selecionou explicitamente apenas 1 métrica e há múltiplas séries
    if (metricasSelecionadas.length === 1 && seriesBrutas.length > 1) {
      const unicaMetrica = metricasSelecionadas[0];
      seriesBrutas.forEach((s) => {
        itens.push(
          construirItemBlocoMetrica({
            serie: s,
            indice: itens.length,
            dispositivoAtivo,
            subTipoEfetivo: unicaMetrica,
            opcoesEfetivas,
            stdGlobal,
            nomeDispositivoExplicito: nomeDispositivoUnico,
            multiplasMetricasAtivas: true,
          })
        );
      });
      return itens;
    }

    // Se está em modo automático (selectedMetrics vazio), há múltiplas séries na query
    // e elas já casaram com mais de 1 métrica distinta, exibe apenas as séries reais da query;
    // caso contrário (ex: painel com 1 série ou todas da mesma métrica), preenche todas as métricas de metricasAlvo.
    const usarApenasSeriesReaisDaQuery =
      metricasSelecionadas.length === 0 &&
      seriesBrutas.length > 1 &&
      metricasAtendidas.size > 1;

    // Adiciona todas as séries que casaram com as métricas alvo
    for (const par of seriesCasadas) {
      itens.push(
        construirItemBlocoMetrica({
          serie: par.serie,
          indice: itens.length,
          dispositivoAtivo,
          subTipoEfetivo: par.metrica,
          opcoesEfetivas,
          stdGlobal,
          nomeDispositivoExplicito: nomeDispositivoUnico,
          multiplasMetricasAtivas: true,
        })
      );
    }

    if (!usarApenasSeriesReaisDaQuery) {
      // Para cada métrica alvo que ainda não teve série específica casada,
      // gera o item no mesmo bloco usando a série disponível
      metricasAlvo.forEach((m, idx) => {
        if (!metricasAtendidas.has(m)) {
          const serieFallback = localizarSerieParaMetrica(
            seriesBrutas,
            m,
            dispositivoAtivo,
            opcoesEfetivas.metricStyles,
            idx
          );
          itens.push(
            construirItemBlocoMetrica({
              serie: serieFallback,
              indice: itens.length,
              dispositivoAtivo,
              subTipoEfetivo: m,
              opcoesEfetivas,
              stdGlobal,
              nomeDispositivoExplicito: nomeDispositivoUnico,
              multiplasMetricasAtivas: true,
            })
          );
        }
      });
    }

    return itens;
  }

  // =========================================================================
  // CENÁRIO 3: MODO PADRÃO (1 MÉTRICA SELECIONADA OU AUTO-DETECÇÃO DE TODAS AS SÉRIES)
  // =========================================================================
  const temMultiplasSeriesParaMesmaMetrica =
    seriesBrutas.length > 1 && Boolean(subTipoUnico);

  seriesBrutas.forEach((s) => {
    const subTipoSerie =
      subTipoUnico ||
      detectarSubTipoMetricaPorTexto(
        `${s.metricaExtraida} ${s.nomeExibicaoBruto}`,
        dispositivoAtivo
      );

    // Se houver múltiplas séries para a mesma métrica (ex: 10 servidores monitorando Uso de CPU),
    // preserva o nome de cada servidor em deviceName para identificá-los individualmente no card!
    const nomeHost =
      s.hostExtraido ||
      (temMultiplasSeriesParaMesmaMetrica ? s.nomeExibicaoBruto : undefined);

    itens.push(
      construirItemBlocoMetrica({
        serie: s,
        indice: itens.length,
        dispositivoAtivo,
        subTipoEfetivo: subTipoSerie,
        opcoesEfetivas,
        stdGlobal,
        nomeDispositivoExplicito: nomeHost,
        multiplasMetricasAtivas: emModoMultiplasMetricas,
      })
    );
  });

  return itens;
}

// Alias para compatibilidade
export const extractMetricsFromData = extrairMetricasDosDados;

export interface BlocoItemEditor {
  indice: number; // 1-based (1, 2, ..., N)
  id: string;
  host?: string;
  metrica: string;
  titulo: string;
  valorFormatado?: string;
  icone?: string;
}

/**
 * Extrai a lista de blocos identificados para exibição no editor de blocos
 */
export function extrairListaBlocosParaEditor(
  dados: DataFrame[] | PanelData | undefined,
  opcoes: Partial<PanelOptions>
): BlocoItemEditor[] {
  let panelData: PanelData | undefined = undefined;
  if (dados) {
    if ('series' in dados && Array.isArray((dados as PanelData).series)) {
      panelData = dados as PanelData;
    } else if (Array.isArray(dados)) {
      panelData = {
        series: dados,
        state: 'Done' as any,
        timeRange: undefined as any,
      };
    }
  }

  if (panelData && panelData.series && panelData.series.length > 0) {
    try {
      const metricas = extrairMetricasDosDados(panelData, opcoes);
      if (metricas.length > 0) {
        return metricas.map((m, idx) => ({
          indice: idx + 1,
          id: m.id || String(idx + 1),
          host: m.deviceName,
          metrica: m.metricName || m.title,
          titulo: m.title,
          valorFormatado: m.displayValue,
          icone: m.icon,
        }));
      }
    } catch {
      // Ignora erro no preview do editor
    }
  }

  // Fallback quando não há séries no preview do editor ainda
  const quantidade =
    opcoes.multiDevices?.enabled && opcoes.multiDevices?.count && opcoes.multiDevices.count > 0
      ? opcoes.multiDevices.count
      : 10;

  const resultado: BlocoItemEditor[] = [];
  for (let i = 1; i <= quantidade; i++) {
    resultado.push({
      indice: i,
      id: String(i),
      host: `Dispositivo ${String(i).padStart(2, '0')}`,
      metrica: 'Métrica Monitorada',
      titulo: `Bloco #${i}`,
      valorFormatado: '--',
    });
  }
  return resultado;
}
