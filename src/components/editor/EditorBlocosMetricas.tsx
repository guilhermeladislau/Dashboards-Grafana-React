import React, { useMemo, useState } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Button, Checkbox, Field, Input, Select, Switch, useTheme2 } from '@grafana/ui';
import {
  BlockOverrideConfig,
  ChartType,
  PanelOptions,
  StandardUnitType,
  ThresholdMode,
} from '../../types';
import { GavetaRetratil } from './GavetaRetratil';
import { ControleCorComReset } from './ControleCorComReset';
import { OPCOES_MODO_LIMIARES, OPCOES_VARIACOES_GRAFICOS } from './EditorEstilizacaoVisual';
import { OPCOES_UNIDADES } from './EditorStandardOptions';
import {
  BlocoItemEditor,
  extrairListaBlocosParaEditor,
} from '../../utilitarios/processadorDados';

/**
 * Converte expressões como "3,4,5,6,7,11,16,34,49" ou "3-7, 11, 16, 34, 49"
 * em uma lista ordenada de números inteiros de 1 a totalBlocos.
 */
export function analisarIndicesBlocos(expressao: string, totalBlocos: number): number[] {
  if (!expressao || expressao.trim() === '') {
    return [];
  }

  const partes = expressao.split(/[,;\s]+/).map((p) => p.trim()).filter(Boolean);
  const selecionados = new Set<number>();

  for (const parte of partes) {
    if (parte.includes('-')) {
      const [inicioStr, fimStr] = parte.split('-');
      const inicio = parseInt(inicioStr, 10);
      const fim = parseInt(fimStr, 10);
      if (!isNaN(inicio) && !isNaN(fim)) {
        const min = Math.max(1, Math.min(inicio, fim));
        const max = Math.min(totalBlocos, Math.max(inicio, fim));
        for (let i = min; i <= max; i++) {
          selecionados.add(i);
        }
      }
    } else {
      const num = parseInt(parte, 10);
      if (!isNaN(num) && num >= 1 && num <= totalBlocos) {
        selecionados.add(num);
      }
    }
  }

  return Array.from(selecionados).sort((a, b) => a - b);
}

export const EditorBlocosMetricas: React.FC<
  StandardEditorProps<Record<string, BlockOverrideConfig>, any, PanelOptions>
> = ({ value, onChange, context }) => {
  const tema = useTheme2();
  const opcoes = context?.options || ({} as Partial<PanelOptions>);
  const seriesDados = context?.data;

  // Extrai lista de blocos identificados na query ou modelo de fallback
  const listaBlocos: BlocoItemEditor[] = useMemo(() => {
    return extrairListaBlocosParaEditor(seriesDados, opcoes);
  }, [seriesDados, opcoes]);

  const totalBlocos = listaBlocos.length;

  // Estado da seleção de blocos (ex: [3, 4, 5, 6, 7, 11, 16, 34, 49])
  const [indicesSelecionados, setIndicesSelecionados] = useState<number[]>([]);
  const [textoExpressao, setTextoExpressao] = useState<string>('');
  const [gavetaLoteAberta, setGavetaLoteAberta] = useState<boolean>(true);

  // Estado do formulário de aplicação em lote
  const [loteLinkUrl, setLoteLinkUrl] = useState<string>('');
  const [loteLinkTargetBlank, setLoteLinkTargetBlank] = useState<boolean>(true);
  const [loteDisplayName, setLoteDisplayName] = useState<string>('');
  const [loteUnit, setLoteUnit] = useState<StandardUnitType>('auto');
  const [loteDecimalsAuto, setLoteDecimalsAuto] = useState<boolean>(true);
  const [loteCustomDecimals, setLoteCustomDecimals] = useState<number>(0);
  const [lotePrefix, setLotePrefix] = useState<string>('');
  const [loteSuffix, setLoteSuffix] = useState<string>('');
  const [loteMin, setLoteMin] = useState<string>('');
  const [loteMax, setLoteMax] = useState<string>('');
  const [loteNoValue, setLoteNoValue] = useState<string>('');
  const [loteChartType, setLoteChartType] = useState<ChartType>('auto');
  const [loteSparklineColor, setLoteSparklineColor] = useState<string>('');
  const [loteThresholdMode, setLoteThresholdMode] = useState<ThresholdMode>('auto');
  const [loteThresholdWarning, setLoteThresholdWarning] = useState<string>('');
  const [loteThresholdCritical, setLoteThresholdCritical] = useState<string>('');
  const [loteColorOk, setLoteColorOk] = useState<string>('');
  const [loteColorWarning, setLoteColorWarning] = useState<string>('');
  const [loteColorCritical, setLoteColorCritical] = useState<string>('');

  const mapaOverrides: Record<string, BlockOverrideConfig> = value || {};

  // Alterna a seleção de um bloco individual clicado no badge
  const alternarBloco = (indice: number) => {
    let novos: number[];
    if (indicesSelecionados.includes(indice)) {
      novos = indicesSelecionados.filter((i) => i !== indice);
    } else {
      novos = [...indicesSelecionados, indice].sort((a, b) => a - b);
    }
    setIndicesSelecionados(novos);
    setTextoExpressao(novos.join(', '));
  };

  // Ao digitar no campo de expressão manual
  const aoAlterarExpressao = (texto: string) => {
    setTextoExpressao(texto);
    const analisados = analisarIndicesBlocos(texto, totalBlocos);
    setIndicesSelecionados(analisados);
  };

  const selecionarTodos = () => {
    const todos = Array.from({ length: totalBlocos }, (_, i) => i + 1);
    setIndicesSelecionados(todos);
    setTextoExpressao(`1-${totalBlocos}`);
  };

  const limparSelecao = () => {
    setIndicesSelecionados([]);
    setTextoExpressao('');
  };

  const inverterSelecao = () => {
    const invertidos: number[] = [];
    for (let i = 1; i <= totalBlocos; i++) {
      if (!indicesSelecionados.includes(i)) {
        invertidos.push(i);
      }
    }
    setIndicesSelecionados(invertidos);
    setTextoExpressao(invertidos.join(', '));
  };

  // Aplica as configurações do formulário de lote nos blocos selecionados
  const aplicarConfiguracaoEmLote = () => {
    if (indicesSelecionados.length === 0) {
      return;
    }

    const copia: Record<string, BlockOverrideConfig> = { ...mapaOverrides };

    indicesSelecionados.forEach((idx) => {
      const chave = String(idx);
      const anterior = copia[chave] || { index: idx };

      copia[chave] = {
        ...anterior,
        index: idx,
        ...(loteLinkUrl.trim() !== '' ? { linkUrl: loteLinkUrl.trim(), linkTargetBlank: loteLinkTargetBlank } : {}),
        ...(loteDisplayName.trim() !== '' ? { displayName: loteDisplayName.trim() } : {}),
        ...(loteUnit !== 'auto' ? { unit: loteUnit } : {}),
        ...(!loteDecimalsAuto ? { decimalsAuto: false, customDecimals: loteCustomDecimals } : {}),
        ...(lotePrefix.trim() !== '' ? { prefix: lotePrefix.trim() } : {}),
        ...(loteSuffix.trim() !== '' ? { suffix: loteSuffix.trim() } : {}),
        ...(loteMin !== '' && !isNaN(Number(loteMin)) ? { min: Number(loteMin) } : {}),
        ...(loteMax !== '' && !isNaN(Number(loteMax)) ? { max: Number(loteMax) } : {}),
        ...(loteNoValue.trim() !== '' ? { noValue: loteNoValue.trim() } : {}),
        ...(loteChartType !== 'auto' ? { chartType: loteChartType } : {}),
        ...(loteSparklineColor ? { sparklineColor: loteSparklineColor } : {}),
        ...(loteThresholdMode !== 'auto' ? { thresholdMode: loteThresholdMode } : {}),
        ...(loteThresholdWarning !== '' && !isNaN(Number(loteThresholdWarning))
          ? { thresholdWarning: Number(loteThresholdWarning) }
          : {}),
        ...(loteThresholdCritical !== '' && !isNaN(Number(loteThresholdCritical))
          ? { thresholdCritical: Number(loteThresholdCritical) }
          : {}),
        ...(loteColorOk ? { colorOk: loteColorOk } : {}),
        ...(loteColorWarning ? { colorWarning: loteColorWarning } : {}),
        ...(loteColorCritical ? { colorCritical: loteColorCritical } : {}),
      };
    });

    onChange(copia);
  };

  const atualizarBlocoIndividual = (indice: number, parcial: Partial<BlockOverrideConfig>) => {
    const chave = String(indice);
    const atual = mapaOverrides[chave] || { index: indice };
    onChange({
      ...mapaOverrides,
      [chave]: {
        ...atual,
        index: indice,
        ...parcial,
      },
    });
  };

  const resetarBloco = (indice: number) => {
    const chave = String(indice);
    const copia: Record<string, any> = { ...mapaOverrides };
    copia[chave] = undefined;
    onChange(copia);
  };

  const resetarTodosBlocos = () => {
    const copia: Record<string, any> = {};
    Object.keys(mapaOverrides).forEach((k) => {
      copia[k] = undefined;
    });
    for (let i = 1; i <= totalBlocos; i++) {
      copia[String(i)] = undefined;
    }
    onChange(copia);
  };

  const totalCustomizados = Object.keys(mapaOverrides).filter((k) => {
    const v = mapaOverrides[k];
    return Boolean(
      v &&
        (v.linkUrl ||
          v.displayName ||
          (v.unit && v.unit !== 'auto') ||
          v.decimalsAuto === false ||
          v.prefix ||
          v.suffix ||
          v.min !== undefined ||
          v.max !== undefined ||
          v.noValue ||
          (v.chartType && v.chartType !== 'auto') ||
          v.sparklineColor ||
          (v.thresholdMode && v.thresholdMode !== 'auto') ||
          v.thresholdWarning !== undefined ||
          v.thresholdCritical !== undefined ||
          v.colorOk ||
          v.colorWarning ||
          v.colorCritical ||
          v.fixedMetricColor)
    );
  }).length;

  return (
    <GavetaRetratil
      titulo={`🔗 Configuração & Links por Bloco${
        totalCustomizados > 0 ? ` (${totalCustomizados} customizado(s))` : ''
      }`}
      subtitulo="Seleção de blocos (ex: 3-7, 11, 16), links clicáveis e Standard Options por métrica"
      abertaInicial={false}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* =================================================================== */}
      {/* 1. SELEÇÃO DE BLOCOS DE MÉTRICAS (EX: 3,4,5,6,7,11,16,34,49)         */}
      {/* =================================================================== */}
      <div
        style={{
          background: tema.colors.background.secondary,
          border: `1px solid ${tema.colors.border.weak}`,
          borderRadius: 8,
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>🎯</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: tema.colors.text.primary }}>
              Seleção de Blocos ({totalBlocos} identificados)
            </span>
          </div>
          {totalCustomizados > 0 && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              fill="text"
              icon="history"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resetarTodosBlocos();
              }}
              title="Restaura as configurações de todos os blocos"
            >
              Resetar todos ({totalCustomizados})
            </Button>
          )}
        </div>

        <Field
          label="Selecionar por número ou intervalo"
          description="Digite os números dos blocos desejados (ex.: 3,4,5,6,7,11,16,34,49 ou 3-7, 11, 16, 34, 49)"
          style={{ marginBottom: 0 }}
        >
          <Input
            placeholder="Ex: 3,4,5,6,7,11,16,34,49 ou 3-7, 11, 16"
            value={textoExpressao}
            onChange={(e) => aoAlterarExpressao(e.currentTarget.value)}
          />
        </Field>

        {/* Botões rápidos de controle de seleção */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            fill="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              selecionarTodos();
            }}
          >
            Todos ({totalBlocos})
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            fill="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              inverterSelecao();
            }}
          >
            Inverter
          </Button>
          {indicesSelecionados.length > 0 && (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              fill="text"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                limparSelecao();
              }}
            >
              Limpar seleção
            </Button>
          )}
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 10,
              background: indicesSelecionados.length > 0 ? '#6366f122' : tema.colors.background.canvas,
              color: indicesSelecionados.length > 0 ? '#818cf8' : tema.colors.text.secondary,
              border: `1px solid ${indicesSelecionados.length > 0 ? '#6366f155' : tema.colors.border.weak}`,
            }}
          >
            {indicesSelecionados.length > 0
              ? `${indicesSelecionados.length} selecionado(s)`
              : 'Nenhum selecionado'}
          </span>
        </div>

        {/* Mini grade de badges com clique interativo para cada bloco */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            maxHeight: 140,
            overflowY: 'auto',
            padding: '4px 0',
          }}
        >
          {listaBlocos.map((bloco) => {
            const selecionado = indicesSelecionados.includes(bloco.indice);
            const override = mapaOverrides[String(bloco.indice)];
            const temLink = Boolean(override?.linkUrl);
            const customizado = Boolean(override);

            return (
              <button
                key={bloco.indice}
                type="button"
                onClick={() => alternarBloco(bloco.indice)}
                title={`#${bloco.indice} • ${bloco.host || bloco.metrica || bloco.titulo}${
                  temLink ? ' (🔗 Link Ativo)' : ''
                }${customizado ? ' (✨ Customizado)' : ''}`}
                style={{
                  minWidth: 32,
                  height: 24,
                  fontSize: 11,
                  fontWeight: selecionado ? 700 : 500,
                  borderRadius: 4,
                  border: `1px solid ${
                    selecionado
                      ? '#6366f1'
                      : customizado
                      ? '#3b82f6'
                      : tema.colors.border.weak
                  }`,
                  background: selecionado
                    ? '#6366f1'
                    : customizado
                    ? '#3b82f622'
                    : tema.colors.background.primary,
                  color: selecionado
                    ? '#ffffff'
                    : customizado
                    ? '#60a5fa'
                    : tema.colors.text.primary,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 6px',
                  transition: 'all 0.15s ease',
                }}
              >
                {bloco.indice}
                {temLink && <span style={{ marginLeft: 2, fontSize: 8 }}>🔗</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. PAINEL DE APLICAÇÃO EM LOTE NOS BLOCOS SELECIONADOS              */}
      {/* =================================================================== */}
      {indicesSelecionados.length > 0 && (
        <div
          style={{
            background: tema.colors.background.secondary,
            border: '1px solid #6366f155',
            borderRadius: 8,
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
            onClick={() => setGavetaLoteAberta(!gavetaLoteAberta)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#818cf8' }}>
                Aplicar aos {indicesSelecionados.length} blocos selecionados
              </span>
            </div>
            <span style={{ fontSize: 11, color: tema.colors.text.secondary }}>
              {gavetaLoteAberta ? 'Ocultar ▲' : 'Expandir ▼'}
            </span>
          </div>

          {gavetaLoteAberta && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              {/* Link de Redirecionamento */}
              <Field
                label="🔗 Link de Redirecionamento (URL)"
                description="Torna o quadradinho da métrica clicável. Variáveis suportadas: ${host}, $host, ${deviceName}, ${metricName}, ${title}"
              >
                <Input
                  placeholder="https://zabbix.empresa.com/hosts.php?host=${host} ou /d/detalhe?var-host=${deviceName}"
                  value={loteLinkUrl}
                  onChange={(e) => setLoteLinkUrl(e.currentTarget.value)}
                />
              </Field>

              <Field label="Abrir em Nova Aba" description="Abre a URL em uma nova guia do navegador">
                <Switch
                  value={loteLinkTargetBlank}
                  onChange={(e) => setLoteLinkTargetBlank(e.currentTarget.checked)}
                />
              </Field>

              {/* Standard Options */}
              <Field label="Nome de Exibição (Display Name)">
                <Input
                  placeholder="Deixe em branco para manter o padrão"
                  value={loteDisplayName}
                  onChange={(e) => setLoteDisplayName(e.currentTarget.value)}
                />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Field label="Unidade (Unit)">
                  <Select
                    options={OPCOES_UNIDADES}
                    value={loteUnit}
                    onChange={(opt) => setLoteUnit((opt.value as StandardUnitType) || 'auto')}
                  />
                </Field>
                <Field label="Casas Decimais">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Checkbox
                      label="Auto"
                      value={loteDecimalsAuto}
                      onChange={(e) => setLoteDecimalsAuto(e.currentTarget.checked)}
                    />
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      disabled={loteDecimalsAuto}
                      placeholder={loteDecimalsAuto ? 'Auto' : '0'}
                      value={loteDecimalsAuto ? '' : loteCustomDecimals === 0 ? '' : loteCustomDecimals}
                      onChange={(e) => setLoteCustomDecimals(e.currentTarget.value === '' ? 0 : Number(e.currentTarget.value))}
                    />
                  </div>
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Field label="Prefixo">
                  <Input
                    placeholder="Ex: ~"
                    value={lotePrefix}
                    onChange={(e) => setLotePrefix(e.currentTarget.value)}
                  />
                </Field>
                <Field label="Sufixo">
                  <Input
                    placeholder="Ex: /s"
                    value={loteSuffix}
                    onChange={(e) => setLoteSuffix(e.currentTarget.value)}
                  />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Field label="Escala Mín">
                  <Input
                    type="number"
                    placeholder="Auto"
                    value={loteMin}
                    onChange={(e) => setLoteMin(e.currentTarget.value)}
                  />
                </Field>
                <Field label="Escala Máx">
                  <Input
                    type="number"
                    placeholder="Auto"
                    value={loteMax}
                    onChange={(e) => setLoteMax(e.currentTarget.value)}
                  />
                </Field>
              </div>

              <Field label="Tipo de Gráfico">
                <Select
                  options={OPCOES_VARIACOES_GRAFICOS}
                  value={loteChartType}
                  onChange={(opt) => setLoteChartType((opt.value as ChartType) || 'auto')}
                />
              </Field>

              <ControleCorComReset
                label="Cor Customizada do Gráfico"
                valor={loteSparklineColor}
                corPadrao="#6366f1"
                rotuloPadrao="Dinâmica por Status"
                onChange={(novaCor) => setLoteSparklineColor(novaCor)}
                onReset={() => setLoteSparklineColor('')}
              />

              <Field label="Esquema de Limiares">
                <Select
                  options={OPCOES_MODO_LIMIARES}
                  value={loteThresholdMode}
                  onChange={(opt) => setLoteThresholdMode((opt.value as ThresholdMode) || 'auto')}
                />
              </Field>

              {loteThresholdMode !== 'fixo' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <Field label="Limiar Atenção">
                    <Input
                      type="number"
                      placeholder="Ex: 70"
                      value={loteThresholdWarning}
                      onChange={(e) => setLoteThresholdWarning(e.currentTarget.value)}
                    />
                  </Field>
                  <Field label="Limiar Crítico">
                    <Input
                      type="number"
                      placeholder="Ex: 85"
                      value={loteThresholdCritical}
                      onChange={(e) => setLoteThresholdCritical(e.currentTarget.value)}
                    />
                  </Field>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <ControleCorComReset
                  label="Cor Normal (OK)"
                  valor={loteColorOk}
                  corPadrao="#22c55e"
                  rotuloPadrao="Verde"
                  onChange={(c) => setLoteColorOk(c)}
                  onReset={() => setLoteColorOk('')}
                />
                <ControleCorComReset
                  label="Cor Atenção"
                  valor={loteColorWarning}
                  corPadrao="#f59e0b"
                  rotuloPadrao="Amarelo"
                  onChange={(c) => setLoteColorWarning(c)}
                  onReset={() => setLoteColorWarning('')}
                />
                <ControleCorComReset
                  label="Cor Crítico"
                  valor={loteColorCritical}
                  corPadrao="#ef4444"
                  rotuloPadrao="Vermelho"
                  onChange={(c) => setLoteColorCritical(c)}
                  onReset={() => setLoteColorCritical('')}
                />
              </div>

              <Field label="Texto Sem Leitura (No Value)">
                <Input
                  placeholder="-"
                  value={loteNoValue}
                  onChange={(e) => setLoteNoValue(e.currentTarget.value)}
                />
              </Field>

              <Button
                type="button"
                variant="primary"
                icon="check"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  aplicarConfiguracaoEmLote();
                }}
                style={{ marginTop: 4 }}
              >
                🚀 Aplicar Configurações aos {indicesSelecionados.length} Blocos Selecionados
              </Button>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. LISTA DE GAVETAS RETRÁTEIS INDIVIDUAIS POR BLOCO (#1 A #N)       */}
      {/* =================================================================== */}
      <GavetaRetratil
        titulo={`📋 Configuração Individual por Bloco (#1 a #${totalBlocos})`}
        subtitulo="Clique para expandir a lista e editar cada bloco separadamente"
        abertaInicial={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

        {listaBlocos.map((bloco) => {
          const chave = String(bloco.indice);
          const override = mapaOverrides[chave] || {};
          const temLink = Boolean(override.linkUrl && override.linkUrl.trim() !== '');
          const customizado = Boolean(
            override.linkUrl ||
              override.displayName ||
              (override.unit && override.unit !== 'auto') ||
              override.decimalsAuto === false ||
              override.prefix ||
              override.suffix ||
              override.min !== undefined ||
              override.max !== undefined ||
              override.noValue ||
              (override.chartType && override.chartType !== 'auto') ||
              override.sparklineColor ||
              (override.thresholdMode && override.thresholdMode !== 'auto') ||
              override.thresholdWarning !== undefined ||
              override.thresholdCritical !== undefined ||
              override.colorOk ||
              override.colorWarning ||
              override.colorCritical ||
              override.fixedMetricColor
          );

          const linkUrl = override.linkUrl || '';
          const linkTargetBlank = override.linkTargetBlank !== false;
          const displayName = override.displayName || '';
          const unit = override.unit || 'auto';
          const decimalsAuto = override.decimalsAuto !== false;
          const customDecimals = override.customDecimals ?? 0;
          const prefix = override.prefix || '';
          const suffix = override.suffix || '';
          const min = override.min;
          const max = override.max;
          const chartType = override.chartType || 'auto';
          const sparklineColor = override.sparklineColor || '';

          const rotuloTitulo = `#${bloco.indice} • ${override.displayName || bloco.host || bloco.metrica || bloco.titulo}${
            temLink ? ' • 🔗 Link' : ''
          }${customizado ? ' • ✨ Customizado' : ''}`;

          const subTitulo = `${bloco.host ? bloco.host + ' • ' : ''}${bloco.metrica || 'Métrica'} ${
            bloco.valorFormatado ? '(' + bloco.valorFormatado + ')' : ''
          }`;

          return (
            <GavetaRetratil
              key={bloco.indice}
              titulo={rotuloTitulo}
              subtitulo={subTitulo}
              abertaInicial={false}
            >
              {/* 1. Link Clicável da Métrica */}
              <Field
                label="🔗 Link de Redirecionamento (URL)"
                description="Torna este quadradinho de métrica clicável para abrir outro dashboard ou página do Zabbix"
              >
                <Input
                  placeholder="https://... ou /d/... (suporta ${host}, ${deviceName})"
                  value={linkUrl}
                  onChange={(e) =>
                    atualizarBlocoIndividual(bloco.indice, { linkUrl: e.currentTarget.value })
                  }
                />
              </Field>

              <Field label="Abrir em Nova Aba">
                <Switch
                  value={linkTargetBlank}
                  onChange={(e) =>
                    atualizarBlocoIndividual(bloco.indice, {
                      linkTargetBlank: e.currentTarget.checked,
                    })
                  }
                />
              </Field>

              {/* 2. Nome de Exibição */}
              <Field label="Nome de Exibição deste Bloco">
                <Input
                  placeholder={bloco.titulo}
                  value={displayName}
                  onChange={(e) =>
                    atualizarBlocoIndividual(bloco.indice, { displayName: e.currentTarget.value })
                  }
                />
              </Field>

              {/* 3. Unidade e Decimais */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Field label="Unidade">
                  <Select
                    options={OPCOES_UNIDADES}
                    value={unit}
                    onChange={(opt) =>
                      atualizarBlocoIndividual(bloco.indice, {
                        unit: (opt.value as StandardUnitType) || 'auto',
                      })
                    }
                  />
                </Field>
                <Field label="Decimais">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Checkbox
                      label="Auto"
                      value={decimalsAuto}
                      onChange={(e) =>
                        atualizarBlocoIndividual(bloco.indice, {
                          decimalsAuto: e.currentTarget.checked,
                        })
                      }
                    />
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      disabled={decimalsAuto}
                      placeholder={decimalsAuto ? 'Auto' : '0'}
                      value={decimalsAuto ? '' : customDecimals === 0 ? '' : customDecimals}
                      onChange={(e) => {
                        const val = e.currentTarget.value;
                        atualizarBlocoIndividual(bloco.indice, {
                          customDecimals: val === '' ? 0 : Number(val),
                        });
                      }}
                    />
                  </div>
                </Field>
              </div>

              {/* 4. Prefixo e Sufixo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Field label="Prefixo">
                  <Input
                    placeholder="Ex: ~"
                    value={prefix}
                    onChange={(e) =>
                      atualizarBlocoIndividual(bloco.indice, { prefix: e.currentTarget.value })
                    }
                  />
                </Field>
                <Field label="Sufixo">
                  <Input
                    placeholder="Ex: /s"
                    value={suffix}
                    onChange={(e) =>
                      atualizarBlocoIndividual(bloco.indice, { suffix: e.currentTarget.value })
                    }
                  />
                </Field>
              </div>

              {/* 5. Escala Min / Max */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Field label="Escala Mín">
                  <Input
                    type="number"
                    placeholder="Auto"
                    value={min ?? ''}
                    onChange={(e) => {
                      const val = e.currentTarget.value;
                      atualizarBlocoIndividual(bloco.indice, {
                        min: val === '' ? undefined : Number(val),
                      });
                    }}
                  />
                </Field>
                <Field label="Escala Máx">
                  <Input
                    type="number"
                    placeholder="Auto"
                    value={max ?? ''}
                    onChange={(e) => {
                      const val = e.currentTarget.value;
                      atualizarBlocoIndividual(bloco.indice, {
                        max: val === '' ? undefined : Number(val),
                      });
                    }}
                  />
                </Field>
              </div>

              {/* 6. Variação do Gráfico */}
              <Field label="Tipo de Gráfico deste Bloco">
                <Select
                  options={OPCOES_VARIACOES_GRAFICOS}
                  value={chartType}
                  onChange={(opt) =>
                    atualizarBlocoIndividual(bloco.indice, {
                      chartType: (opt.value as ChartType) || 'auto',
                    })
                  }
                />
              </Field>

              <ControleCorComReset
                label="Cor Customizada do Gráfico"
                valor={sparklineColor}
                corPadrao="#6366f1"
                rotuloPadrao="Dinâmica por Status"
                onChange={(novaCor) =>
                  atualizarBlocoIndividual(bloco.indice, { sparklineColor: novaCor })
                }
                onReset={() => atualizarBlocoIndividual(bloco.indice, { sparklineColor: '' })}
              />

              {customizado && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  fill="outline"
                  icon="history"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    resetarBloco(bloco.indice);
                  }}
                  style={{ alignSelf: 'flex-start', marginTop: 4 }}
                >
                  Restaurar padrão deste bloco
                </Button>
              )}
            </GavetaRetratil>
          );
        })}
        </div>
      </GavetaRetratil>
      </div>
    </GavetaRetratil>
  );
};
