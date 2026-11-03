import React from 'react';
import { SelectableValue, StandardEditorProps } from '@grafana/data';
import { Field, Select, Input, Switch, RadioButtonGroup, Button } from '@grafana/ui';
import {
  BlockSize,
  ChartType,
  EstilizacaoVisualGroup,
  FontFamily,
  FontSize,
  LayoutColumns,
  PanelOptions,
  ThresholdMode,
} from '../../types';
import { GavetaRetratil } from './GavetaRetratil';
import { ControleCorComReset } from './ControleCorComReset';

export const OPCOES_VARIACOES_GRAFICOS: Array<SelectableValue<ChartType>> = [
  { value: 'auto', label: '✨ Pré-configurado da Métrica (Automático)' },
  { value: 'barra', label: '▬ Barra de Progresso Horizontal' },
  { value: 'circulo', label: '⭕ Círculo / Gauge Radial (360°)' },
  { value: 'arco', label: '🌙 Arco / Semi-Gauge (Estilo Gauge Grafana 180°)' },
  { value: 'anel', label: '🍩 Anel / Donut Moderno com Glow' },
  { value: 'torre', label: '📊 Torre / Colunas Verticais Graduadas' },
  { value: 'area', label: '📈 Linha com Área Preenchida (Stat Grafana)' },
  { value: 'linha', label: '📉 Linha Contínua Limpa (Sparkline Pura)' },
  { value: 'bullet', label: '🎯 Medidor Bullet (Com Linhas de Limiar)' },
  { value: 'termometro', label: '🌡️ Termômetro de Nível Vertical' },
  { value: 'nenhum', label: '🔢 Somente Valor (Sem Gráfico)' },
];

export const OPCOES_MODO_LIMIARES: Array<SelectableValue<ThresholdMode>> = [
  { value: 'auto', label: '✨ Pré-configurado da Métrica (Automático)' },
  { value: 'normal', label: 'Normal (Maior valor = Mais crítico / Alerta)' },
  { value: 'invertido', label: 'Invertido (Menor valor = Mais crítico / Alerta)' },
  { value: 'fixo', label: 'Cor Fixa Única (Sem alteração por limiares)' },
];

export const OPCOES_TAMANHO_BLOCO: Array<SelectableValue<BlockSize>> = [
  { value: 'sm', label: 'Pequeno / Compacto' },
  { value: 'md', label: 'Médio / Padrão' },
  { value: 'lg', label: 'Grande / Amplo' },
  { value: 'xl', label: 'Extra Grande' },
];

export const OPCOES_COLUNAS: Array<SelectableValue<LayoutColumns>> = [
  { value: 'auto', label: 'Auto' },
  { value: '1', label: '1 Col.' },
  { value: '2', label: '2 Col.' },
  { value: '3', label: '3 Col.' },
  { value: '4', label: '4 Col.' },
];

export const OPCOES_FAMILIA_FONTE: Array<SelectableValue<FontFamily>> = [
  { value: 'default', label: 'Padrão Grafana' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'monospace', label: 'Monoespaçada' },
];

export const OPCOES_TAMANHO_FONTE: Array<SelectableValue<FontSize>> = [
  { value: 'sm', label: 'Pequeno (SM)' },
  { value: 'md', label: 'Médio (MD)' },
  { value: 'lg', label: 'Grande (LG)' },
  { value: 'xl', label: 'Extra Grande (XL)' },
];

export const EditorEstilizacaoVisual: React.FC<
  StandardEditorProps<EstilizacaoVisualGroup, any, PanelOptions>
> = ({ value, onChange, context }) => {
  const raiz = context?.options || ({} as Partial<PanelOptions>);
  const grupo = value || {};

  // 1. Gráficos e Limiares
  const chartType: ChartType = grupo.chartType ?? raiz.chartType ?? 'auto';
  const sparklineColor = grupo.sparklineColor ?? raiz.sparklineColor ?? '';
  const showProgressBar =
    grupo.showProgressBar !== undefined
      ? grupo.showProgressBar
      : raiz.showProgressBar !== undefined
      ? raiz.showProgressBar
      : true;
  const showSparkline =
    grupo.showSparkline !== undefined
      ? grupo.showSparkline
      : raiz.showSparkline !== undefined
      ? raiz.showSparkline
      : true;
  const thresholdMode: ThresholdMode = grupo.thresholdMode ?? raiz.thresholdMode ?? 'auto';
  const thresholdWarning =
    grupo.thresholdWarning !== undefined
      ? grupo.thresholdWarning
      : raiz.thresholdWarning !== undefined
      ? raiz.thresholdWarning
      : 70;
  const thresholdCritical =
    grupo.thresholdCritical !== undefined
      ? grupo.thresholdCritical
      : raiz.thresholdCritical !== undefined
      ? raiz.thresholdCritical
      : 85;
  const colorOk = grupo.colorOk ?? raiz.colorOk ?? '';
  const colorWarning = grupo.colorWarning ?? raiz.colorWarning ?? '';
  const colorCritical = grupo.colorCritical ?? raiz.colorCritical ?? '';
  const fixedMetricColor = grupo.fixedMetricColor ?? raiz.fixedMetricColor ?? '';

  // 2. Painel e Layout
  const backgroundColor = grupo.backgroundColor ?? raiz.backgroundColor ?? '';
  const cardBackgroundColor = grupo.cardBackgroundColor ?? raiz.cardBackgroundColor ?? '';
  const textColor = grupo.textColor ?? raiz.textColor ?? '';
  const borderColor = grupo.borderColor ?? raiz.borderColor ?? '';
  const blockSize: BlockSize = grupo.blockSize ?? raiz.blockSize ?? 'md';
  const blockHeight =
    grupo.blockHeight !== undefined
      ? grupo.blockHeight
      : raiz.blockHeight !== undefined
      ? raiz.blockHeight
      : 0;
  const cardWidth =
    grupo.cardWidth !== undefined
      ? grupo.cardWidth
      : raiz.cardWidth !== undefined
      ? raiz.cardWidth
      : 0;
  const cardHeight =
    grupo.cardHeight !== undefined
      ? grupo.cardHeight
      : raiz.cardHeight !== undefined
      ? raiz.cardHeight
      : blockHeight;
  const columns: LayoutColumns = grupo.columns ?? raiz.columns ?? 'auto';
  const showStatusBadge =
    grupo.showStatusBadge !== undefined
      ? grupo.showStatusBadge
      : raiz.showStatusBadge !== undefined
      ? raiz.showStatusBadge
      : true;

  // 3. Tipografia
  const fontFamily: FontFamily = grupo.fontFamily ?? raiz.fontFamily ?? 'default';
  const fontSize: FontSize = grupo.fontSize ?? raiz.fontSize ?? 'md';

  const atualizar = (parcial: Partial<EstilizacaoVisualGroup>) => {
    onChange({
      chartType,
      sparklineColor,
      showProgressBar,
      showSparkline,
      thresholdMode,
      thresholdWarning,
      thresholdCritical,
      colorOk,
      colorWarning,
      colorCritical,
      fixedMetricColor,
      backgroundColor,
      cardBackgroundColor,
      textColor,
      borderColor,
      blockSize,
      blockHeight,
      cardWidth,
      cardHeight,
      columns,
      showStatusBadge,
      fontFamily,
      fontSize,
      ...parcial,
    });
  };

  const temCoresGraficoCustomizadas =
    Boolean(sparklineColor) ||
    Boolean(colorOk) ||
    Boolean(colorWarning) ||
    Boolean(colorCritical) ||
    Boolean(fixedMetricColor);

  const temConfigGraficoCustomizada =
    temCoresGraficoCustomizadas ||
    chartType !== 'auto' ||
    thresholdMode !== 'auto' ||
    thresholdWarning !== 70 ||
    thresholdCritical !== 85 ||
    !showProgressBar ||
    !showSparkline;

  const temCoresPainelCustomizadas =
    Boolean(backgroundColor) ||
    Boolean(cardBackgroundColor) ||
    Boolean(textColor) ||
    Boolean(borderColor);

  const temConfigPainelCustomizada =
    temCoresPainelCustomizadas ||
    blockSize !== 'md' ||
    blockHeight !== 0 ||
    cardWidth !== 0 ||
    cardHeight !== 0 ||
    columns !== 'auto' ||
    !showStatusBadge;

  const temFontesCustomizadas = fontFamily !== 'default' || fontSize !== 'md';

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* =================================================================== */}
      {/* 1. SUBCATEGORIA RETRÁTIL: ESTILIZAÇÃO DO GRÁFICO                    */}
      {/* =================================================================== */}
      <GavetaRetratil
        titulo="Estilização do gráfico"
        subtitulo="Variações do gráfico, cores, limiares de alerta e atenção"
        abertaInicial={false}
      >
        <Field
          label="Variação do Gráfico (Chart Style)"
          description="Escolha a variação visual do gráfico integrado para a leitura da métrica"
        >
          <Select
            options={OPCOES_VARIACOES_GRAFICOS}
            value={chartType}
            onChange={(opt) => atualizar({ chartType: (opt.value as ChartType) || 'auto' })}
          />
        </Field>

        <ControleCorComReset
          label="Cor Customizada do Gráfico"
          description="Sobrescreve a cor do gráfico (Barra, Círculo, Arco, Torre, Área, etc.). Se alterou por engano, clique em voltar ao padrão."
          valor={sparklineColor}
          corPadrao="#6366f1"
          rotuloPadrao="Dinâmica por Status (Padrão)"
          onChange={(novaCor) => atualizar({ sparklineColor: novaCor })}
          onReset={() => atualizar({ sparklineColor: '' })}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field
            label="Gráficos de barra"
            description="Permitir renderização de barra horizontal"
          >
            <Switch
              value={showProgressBar}
              onChange={(e) => atualizar({ showProgressBar: e.currentTarget.checked })}
            />
          </Field>
          <Field
            label="Gráficos de linha/área"
            description="Permitir renderização de sparklines"
          >
            <Switch
              value={showSparkline}
              onChange={(e) => atualizar({ showSparkline: e.currentTarget.checked })}
            />
          </Field>
        </div>

        <Field
          label="Esquema de Cores e Limiares (Color Scheme)"
          description="Define como as cores reagem ao valor da métrica (Verde/Amarelo/Vermelho ou Cor Fixa)"
        >
          <Select
            options={OPCOES_MODO_LIMIARES}
            value={thresholdMode}
            onChange={(opt) => atualizar({ thresholdMode: (opt.value as ThresholdMode) || 'auto' })}
          />
        </Field>

        {thresholdMode !== 'fixo' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field
                label="Limiar de Atenção (Warning)"
                description="Valor numérico que aciona o estado de Atenção"
              >
                <Input
                  type="number"
                  value={thresholdWarning}
                  onChange={(e) => atualizar({ thresholdWarning: Number(e.currentTarget.value) })}
                />
              </Field>
              <Field
                label="Limiar Crítico (Critical)"
                description="Valor numérico que aciona o estado Crítico"
              >
                <Input
                  type="number"
                  value={thresholdCritical}
                  onChange={(e) => atualizar({ thresholdCritical: Number(e.currentTarget.value) })}
                />
              </Field>
            </div>

            <ControleCorComReset
              label="Cor do Estado Normal (OK)"
              description="Indicador quando a métrica está saudável (Abaixo do alerta)"
              valor={colorOk}
              corPadrao="#22c55e"
              rotuloPadrao="Verde (#22c55e)"
              onChange={(novaCor) => atualizar({ colorOk: novaCor })}
              onReset={() => atualizar({ colorOk: '' })}
            />

            <ControleCorComReset
              label="Cor do Estado de Atenção (Warning)"
              description="Indicador quando a métrica atinge o limiar de alerta"
              valor={colorWarning}
              corPadrao="#f59e0b"
              rotuloPadrao="Amarelo (#f59e0b)"
              onChange={(novaCor) => atualizar({ colorWarning: novaCor })}
              onReset={() => atualizar({ colorWarning: '' })}
            />

            <ControleCorComReset
              label="Cor do Estado Crítico (Critical)"
              description="Indicador quando a métrica atinge o limiar crítico"
              valor={colorCritical}
              corPadrao="#ef4444"
              rotuloPadrao="Vermelho (#ef4444)"
              onChange={(novaCor) => atualizar({ colorCritical: novaCor })}
              onReset={() => atualizar({ colorCritical: '' })}
            />
          </>
        )}

        {thresholdMode === 'fixo' && (
          <ControleCorComReset
            label="Cor Fixa da Métrica"
            description="Cor constante aplicada em todo o bloco"
            valor={fixedMetricColor}
            corPadrao="#3b82f6"
            rotuloPadrao="Azul (#3b82f6)"
            onChange={(novaCor) => atualizar({ fixedMetricColor: novaCor })}
            onReset={() => atualizar({ fixedMetricColor: '' })}
          />
        )}

        {(temCoresGraficoCustomizadas || temConfigGraficoCustomizada) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {temCoresGraficoCustomizadas && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                fill="outline"
                icon="history"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  atualizar({
                    sparklineColor: '',
                    colorOk: '',
                    colorWarning: '',
                    colorCritical: '',
                    fixedMetricColor: '',
                  });
                }}
              >
                Restaurar todas as cores do gráfico
              </Button>
            )}
            {temConfigGraficoCustomizada && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                fill="outline"
                icon="history"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  atualizar({
                    chartType: 'auto',
                    sparklineColor: '',
                    showProgressBar: true,
                    showSparkline: true,
                    thresholdMode: 'auto',
                    thresholdWarning: 70,
                    thresholdCritical: 85,
                    colorOk: '',
                    colorWarning: '',
                    colorCritical: '',
                    fixedMetricColor: '',
                  });
                }}
              >
                Restaurar padrão do gráfico
              </Button>
            )}
          </div>
        )}
      </GavetaRetratil>

      {/* =================================================================== */}
      {/* 2. SUBCATEGORIA RETRÁTIL: ESTILIZAÇÃO DO PAINEL                    */}
      {/* =================================================================== */}
      <GavetaRetratil
        titulo="Estilização do painel"
        subtitulo="Cores de fundo, borda, texto, dimensionamento e layout dos blocos"
        abertaInicial={false}
      >
        <ControleCorComReset
          label="Cor de Fundo do Painel"
          description="Deixe no padrão para herdar o fundo nativo do tema do Grafana"
          valor={backgroundColor}
          corPadrao="transparent"
          rotuloPadrao="Transparente (Padrão Grafana)"
          onChange={(novaCor) => atualizar({ backgroundColor: novaCor })}
          onReset={() => atualizar({ backgroundColor: '' })}
        />

        <ControleCorComReset
          label="Cor de Fundo dos Blocos (Cards)"
          description="Deixe no padrão para manter o degradê escuro do tema"
          valor={cardBackgroundColor}
          corPadrao="#1e293b"
          rotuloPadrao="Degradê Noturno (Padrão)"
          onChange={(novaCor) => atualizar({ cardBackgroundColor: novaCor })}
          onReset={() => atualizar({ cardBackgroundColor: '' })}
        />

        <ControleCorComReset
          label="Cor do Texto"
          description="Cor personalizada para títulos e valores das métricas"
          valor={textColor}
          corPadrao="#f8fafc"
          rotuloPadrao="Branco Neve (Padrão)"
          onChange={(novaCor) => atualizar({ textColor: novaCor })}
          onReset={() => atualizar({ textColor: '' })}
        />

        <ControleCorComReset
          label="Cor da Borda dos Blocos"
          description="Borda de contorno dos blocos de monitoramento"
          valor={borderColor}
          corPadrao="rgba(99, 102, 241, 0.35)"
          rotuloPadrao="Índigo Neon Suave (Padrão)"
          onChange={(novaCor) => atualizar({ borderColor: novaCor })}
          onReset={() => atualizar({ borderColor: '' })}
        />

        {temCoresPainelCustomizadas && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            fill="outline"
            icon="history"
            style={{ alignSelf: 'flex-start', marginTop: 4, marginBottom: 8 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              atualizar({
                backgroundColor: '',
                cardBackgroundColor: '',
                textColor: '',
                borderColor: '',
              });
            }}
          >
            Restaurar todas as cores do painel
          </Button>
        )}

        <Field
          label="Tamanho dos Blocos de Monitoramento"
          description="Ajusta a escala física dos blocos (altura mínima, preenchimento e escala dos gráficos)"
        >
          <RadioButtonGroup
            options={OPCOES_TAMANHO_BLOCO}
            value={blockSize}
            onChange={(val) => atualizar({ blockSize: val as BlockSize })}
            fullWidth
          />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field
            label="Largura do Card (px)"
            description="Mais largo ou estreito (máx: 1200px. 0 = auto)"
          >
            <Input
              type="number"
              min={0}
              max={1200}
              step={10}
              placeholder="0 = Auto"
              value={cardWidth === 0 ? '' : cardWidth}
              onChange={(e) => {
                const val = e.currentTarget.value;
                if (val === '') {
                  atualizar({ cardWidth: 0 });
                } else {
                  const num = Number(val);
                  atualizar({ cardWidth: Math.min(1200, Math.max(0, num)) });
                }
              }}
            />
          </Field>

          <Field
            label="Altura do Card (px)"
            description="Mais longo ou curto (máx: 800px. 0 = auto)"
          >
            <Input
              type="number"
              min={0}
              max={800}
              step={10}
              placeholder="0 = Auto"
              value={cardHeight === 0 ? '' : cardHeight}
              onChange={(e) => {
                const val = e.currentTarget.value;
                if (val === '') {
                  atualizar({ cardHeight: 0, blockHeight: 0 });
                } else {
                  const num = Number(val);
                  const validado = Math.min(800, Math.max(0, num));
                  atualizar({ cardHeight: validado, blockHeight: validado });
                }
              }}
            />
          </Field>
        </div>

        <Field
          label="Distribuição de Colunas"
          description="Quantidade de colunas dos blocos na grade de visualização"
        >
          <RadioButtonGroup
            options={OPCOES_COLUNAS}
            value={columns}
            onChange={(val) => atualizar({ columns: val as LayoutColumns })}
            fullWidth
          />
        </Field>

        <Field
          label="Exibir Tag de Status"
          description="Exibe crachá indicativo no card (ex.: ONLINE, NORMAL, ATENÇÃO, CRÍTICO)"
        >
          <Switch
            value={showStatusBadge}
            onChange={(e) => atualizar({ showStatusBadge: e.currentTarget.checked })}
          />
        </Field>

        {temConfigPainelCustomizada && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            fill="outline"
            icon="history"
            style={{ alignSelf: 'flex-start', marginTop: 4 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              atualizar({
                backgroundColor: '',
                cardBackgroundColor: '',
                textColor: '',
                borderColor: '',
                blockSize: 'md',
                blockHeight: 0,
                cardWidth: 0,
                cardHeight: 0,
                columns: 'auto',
                showStatusBadge: true,
                showProgressBar: true,
                showSparkline: true,
              });
            }}
          >
            Restaurar padrão do painel
          </Button>
        )}
      </GavetaRetratil>

      {/* =================================================================== */}
      {/* 3. SUBCATEGORIA RETRÁTIL: FONTES E TIPOGRAFIA                       */}
      {/* =================================================================== */}
      <GavetaRetratil
        titulo="Fontes e tipografia"
        subtitulo="Família da fonte e escala de tamanho dos textos e métricas"
        abertaInicial={false}
      >
        <Field
          label="Família da Fonte"
          description="Fonte tipográfica aplicada aos títulos e valores numéricos do painel"
        >
          <Select
            options={OPCOES_FAMILIA_FONTE}
            value={fontFamily}
            onChange={(opt) => atualizar({ fontFamily: (opt.value as FontFamily) || 'default' })}
          />
        </Field>

        <Field
          label="Escala de Tamanho da Fonte"
          description="Escala de tamanho dos textos e valores dos blocos"
        >
          <RadioButtonGroup
            options={OPCOES_TAMANHO_FONTE}
            value={fontSize}
            onChange={(val) => atualizar({ fontSize: val as FontSize })}
            fullWidth
          />
        </Field>

        {temFontesCustomizadas && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            fill="outline"
            icon="history"
            style={{ alignSelf: 'flex-start', marginTop: 4 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              atualizar({
                fontFamily: 'default',
                fontSize: 'md',
              });
            }}
          >
            Restaurar padrão de fontes
          </Button>
        )}
      </GavetaRetratil>
    </div>
  );
};
