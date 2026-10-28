import { FieldType, formattedValueToString, getFieldDisplayName, PanelData } from '@grafana/data';
import {
  ChartType,
  MetricBlockItem,
  MetricCategory,
  MetricDataPoint,
  MetricStatusLevel,
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
  METADADOS_DISPOSITIVOS,
  obterDispositivoAtivo,
  obterSubTipoAtivo,
  PRECONFIGURACOES_METRICAS,
  ROTULOS_SUBTIPOS,
} from './subtipos';

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

/**
 * Extrai e estrutura os dados das queries do Zabbix, combinando:
 * 1) Pré-configurações do Dispositivo e Métrica selecionados
 * 2) Sobrescritas do Standard Options (Unidade, Decimais, Min/Max, Limiares, Gráfico, Nome)
 * 3) Detecção automática inteligente quando em modo automático
 */
export function extrairMetricasDosDados(
  dados: PanelData,
  opcoes?: Partial<PanelOptions>
): MetricBlockItem[] {
  if (!dados || !dados.series || dados.series.length === 0) {
    return [];
  }

  const dispositivoAtivo = obterDispositivoAtivo(opcoes);
  const subTipoAtivo = obterSubTipoAtivo(opcoes);
  const preconfig = subTipoAtivo ? PRECONFIGURACOES_METRICAS[subTipoAtivo] : undefined;
  const infoDispositivo = METADADOS_DISPOSITIVOS[dispositivoAtivo];

  const std = {
    unit: opcoes?.standardOptions?.unit ?? opcoes?.standardUnit,
    decimalsAuto:
      opcoes?.standardOptions?.decimalsAuto !== undefined
        ? opcoes.standardOptions.decimalsAuto
        : opcoes?.decimalsAuto !== false,
    customDecimals:
      opcoes?.standardOptions?.customDecimals !== undefined
        ? opcoes.standardOptions.customDecimals
        : opcoes?.customDecimals,
    displayName:
      opcoes?.standardOptions?.displayName !== undefined
        ? opcoes.standardOptions.displayName
        : opcoes?.standardDisplayName,
    prefix:
      opcoes?.standardOptions?.prefix !== undefined
        ? opcoes.standardOptions.prefix
        : opcoes?.standardPrefix,
    suffix:
      opcoes?.standardOptions?.suffix !== undefined
        ? opcoes.standardOptions.suffix
        : opcoes?.standardSuffix,
    min:
      opcoes?.standardOptions?.min !== undefined
        ? opcoes.standardOptions.min
        : opcoes?.standardMin,
    max:
      opcoes?.standardOptions?.max !== undefined
        ? opcoes.standardOptions.max
        : opcoes?.standardMax,
    noValue:
      opcoes?.standardOptions?.noValue !== undefined
        ? opcoes.standardOptions.noValue
        : opcoes?.standardNoValue || '-',
  };

  const textoSemValor = std.noValue;

  const itens: MetricBlockItem[] = [];

  for (const series of dados.series) {
    const campoTempo = series.fields.find((f) => f.type === FieldType.time);
    const camposValor = series.fields.filter(
      (f) => f.type === FieldType.number || f.type === FieldType.string
    );

    for (const campo of camposValor) {
      const nomeExibicaoBruto =
        campo.config.displayName ||
        getFieldDisplayName(campo, series, dados.series) ||
        campo.name;
      const nomeMinusculo = nomeExibicaoBruto.toLowerCase();
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

      const valorNumerico =
        typeof ultimoValor === 'number' ? ultimoValor : Number(ultimoValor);
      const ehNumero = !isNaN(valorNumerico) && ultimoValor !== null && ultimoValor !== '';

      // 1. Resolução das opções Standard Options (Prioridade: Dropdown Manual > FieldConfig Grafana > Pré-configuração da Métrica)
      const unidadeEfetiva: Exclude<StandardUnitType, 'auto'> | null =
        std.unit && std.unit !== 'auto'
          ? std.unit
          : preconfig?.unidadePadrao || null;

      let decimaisEfetivos: number | null = 1;
      if (std.decimalsAuto !== false) {
        decimaisEfetivos =
          campo.config.decimals !== undefined && campo.config.decimals !== null
            ? campo.config.decimals
            : preconfig?.decimais ?? 1;
      } else {
        const manual = std.customDecimals;
        if (
          manual === undefined ||
          manual === null ||
          isNaN(Number(manual)) ||
          Number(manual) === 0
        ) {
          decimaisEfetivos = null;
        } else {
          decimaisEfetivos = Math.max(0, Math.floor(Number(manual)));
        }
      }

      const minEfetivo: number =
        std.min !== undefined &&
        std.min !== null &&
        !isNaN(Number(std.min))
          ? Number(std.min)
          : campo.config.min !== undefined && campo.config.min !== null
          ? campo.config.min
          : preconfig?.minimo ?? 0;

      const maxEfetivo: number =
        std.max !== undefined &&
        std.max !== null &&
        !isNaN(Number(std.max))
          ? Number(std.max)
          : campo.config.max !== undefined && campo.config.max !== null
          ? campo.config.max
          : preconfig?.maximo ?? 100;

      const limiarAtencao =
        opcoes?.thresholdWarning !== undefined && !isNaN(Number(opcoes.thresholdWarning))
          ? Number(opcoes.thresholdWarning)
          : preconfig?.limiarAtencao ?? 70;

      const limiarCritico =
        opcoes?.thresholdCritical !== undefined && !isNaN(Number(opcoes.thresholdCritical))
          ? Number(opcoes.thresholdCritical)
          : preconfig?.limiarCritico ?? 85;

      const modoLimiarEfetivo: 'normal' | 'invertido' | 'fixo' =
        opcoes?.thresholdMode && opcoes.thresholdMode !== 'auto'
          ? opcoes.thresholdMode
          : preconfig?.modoLimiar ?? 'normal';

      let categoria: MetricCategory = preconfig?.categoria || 'generic';
      let nivelStatus: MetricStatusLevel = 'info';
      let tagStatus: string | undefined = undefined;
      let subTexto: string | undefined = preconfig?.subTextoPadrao;
      let corStatus = opcoes?.fixedMetricColor || infoDispositivo.corDestaque || '#3b82f6';
      let percentual: number | undefined = undefined;
      let valorExibicao = textoSemValor;
      let icone: string | undefined = preconfig?.icone;

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
          // Status Binários (Online/Offline, VM Ligada/Desligada, Porta UP/DOWN)
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
          }
          // Saúde Geral (0/1 = Saudável, 2 = Atenção, >=3 = Crítico)
          else if (unidadeEfetiva === 'saude') {
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
          }
          // Uptime
          else if (unidadeEfetiva === 'uptime') {
            categoria = 'uptime';
            nivelStatus = 'ok';
            tagStatus = 'ATIVO';
            corStatus = '#22c55e';
          }
          // Demais métricas numéricas (Percentual, Bytes, Banda, Latência, Clientes, Temperatura, etc.)
          else {
            percentual = calcularPercentualEscala(valorNumerico, minEfetivo, maxEfetivo);

            if (modoLimiarEfetivo === 'fixo') {
              nivelStatus = 'ok';
              tagStatus =
                unidadeEfetiva === 'bps'
                  ? 'TRÁFEGO'
                  : unidadeEfetiva === 'bytes'
                  ? 'VOLUME'
                  : 'ATIVO';
              corStatus = opcoes?.fixedMetricColor || infoDispositivo.corDestaque || '#38bdf8';
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
              // Modo normal: compara o valor com limiarAtencao e limiarCritico
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
            opcoes?.fixedMetricColor ||
            campo.config.color?.fixedColor ||
            infoDispositivo.corDestaque ||
            '#6366f1';
        }
      }

      // 2. Resolução do Tipo de Gráfico (Prioridade: Seleção Manual > Pré-configuração da Métrica > Auto por Categoria)
      let graficoResolvido: Exclude<ChartType, 'auto'> = 'barra';
      if (opcoes?.chartType && opcoes.chartType !== 'auto') {
        graficoResolvido = opcoes.chartType;
      } else if (preconfig?.graficoPadrao) {
        graficoResolvido = preconfig.graficoPadrao;
      } else if (categoria === 'percentage' || categoria === 'disk') {
        graficoResolvido = 'barra';
      } else if (categoria === 'status' || categoria === 'uptime') {
        graficoResolvido = 'nenhum';
      } else {
        graficoResolvido = 'area';
      }

      // Se possui pontos ou valor numérico e o usuário forçou um gráfico proporcional, garante um percentual
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

      // 3. Resolução do Título da Métrica
      let tituloFinal = nomeExibicaoBruto;
      if (std.displayName && std.displayName.trim() !== '') {
        tituloFinal = std.displayName.trim();
      } else if (
        subTipoAtivo &&
        opcoes?.overrideCardTitleWithPreset !== false &&
        ROTULOS_SUBTIPOS[subTipoAtivo]
      ) {
        tituloFinal = ROTULOS_SUBTIPOS[subTipoAtivo];
      }

      // Aplica cores personalizadas de limiar (OK, Warning, Critical) quando configuradas
      if (modoLimiarEfetivo === 'fixo') {
        corStatus = opcoes?.fixedMetricColor || corStatus;
      } else if (nivelStatus === 'ok' && opcoes?.colorOk) {
        corStatus = opcoes.colorOk;
      } else if (nivelStatus === 'warning' && opcoes?.colorWarning) {
        corStatus = opcoes.colorWarning;
      } else if (
        (nivelStatus === 'critical' || nivelStatus === 'offline') &&
        opcoes?.colorCritical
      ) {
        corStatus = opcoes.colorCritical;
      }

      // Aplica prefixo e sufixo do Standard Options clonado
      if (valorExibicao !== textoSemValor) {
        if (std.prefix) {
          valorExibicao = `${std.prefix}${valorExibicao}`;
        }
        if (std.suffix) {
          valorExibicao = `${valorExibicao}${std.suffix}`;
        }
      }

      itens.push({
        id: `${series.refId || ''}_${campo.name}_${series.name || ''}_${itens.length}`,
        title: tituloFinal,
        currentValue: ultimoValor,
        displayValue: valorExibicao,
        unit: unidadeEfetiva || unidadeCampoGrafana,
        points: pontos,
        category: categoria,
        statusLevel: nivelStatus,
        statusBadge: tagStatus,
        subText: subTexto,
        percentage: percentual,
        statusColor: corStatus,
        icon: icone,
        deviceType: dispositivoAtivo,
        chartType: graficoResolvido,
      });
    }
  }

  return itens;
}

// Alias para compatibilidade
export const extractMetricsFromData = extrairMetricasDosDados;
