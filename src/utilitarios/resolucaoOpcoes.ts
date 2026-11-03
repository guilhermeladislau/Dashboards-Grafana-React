import {
  BlockSize,
  ChartType,
  EstilizacaoVisualGroup,
  FontFamily,
  FontSize,
  LayoutColumns,
  PanelOptions,
  ThresholdMode,
} from '../types';

/**
 * Resolve todas as opções visuais combinando a nova estrutura de gavetas retráteis
 * (estilizacaoVisual) com as propriedades planas para máxima retrocompatibilidade.
 */
export function resolverOpcoesVisuais(
  opcoes?: Partial<PanelOptions>
): Required<EstilizacaoVisualGroup> {
  const v = opcoes?.estilizacaoVisual || {};
  return {
    chartType: (v.chartType ?? opcoes?.chartType ?? 'auto') as ChartType,
    sparklineColor: v.sparklineColor ?? opcoes?.sparklineColor ?? '',
    showProgressBar:
      v.showProgressBar !== undefined
        ? v.showProgressBar
        : opcoes?.showProgressBar !== undefined
        ? opcoes.showProgressBar
        : true,
    showSparkline:
      v.showSparkline !== undefined
        ? v.showSparkline
        : opcoes?.showSparkline !== undefined
        ? opcoes.showSparkline
        : true,
    thresholdMode: (v.thresholdMode ?? opcoes?.thresholdMode ?? 'auto') as ThresholdMode,
    thresholdWarning:
      v.thresholdWarning !== undefined
        ? v.thresholdWarning
        : opcoes?.thresholdWarning !== undefined
        ? opcoes.thresholdWarning
        : 70,
    thresholdCritical:
      v.thresholdCritical !== undefined
        ? v.thresholdCritical
        : opcoes?.thresholdCritical !== undefined
        ? opcoes.thresholdCritical
        : 85,
    colorOk: v.colorOk ?? opcoes?.colorOk ?? '',
    colorWarning: v.colorWarning ?? opcoes?.colorWarning ?? '',
    colorCritical: v.colorCritical ?? opcoes?.colorCritical ?? '',
    fixedMetricColor: v.fixedMetricColor ?? opcoes?.fixedMetricColor ?? '',
    backgroundColor: v.backgroundColor ?? opcoes?.backgroundColor ?? '',
    cardBackgroundColor: v.cardBackgroundColor ?? opcoes?.cardBackgroundColor ?? '',
    textColor: v.textColor ?? opcoes?.textColor ?? '',
    borderColor: v.borderColor ?? opcoes?.borderColor ?? '',
    blockSize: (v.blockSize ?? opcoes?.blockSize ?? 'md') as BlockSize,
    blockHeight:
      v.blockHeight !== undefined
        ? v.blockHeight
        : opcoes?.blockHeight !== undefined
        ? opcoes.blockHeight
        : 0,
    cardWidth: (() => {
      const w = v.cardWidth !== undefined ? v.cardWidth : opcoes?.cardWidth ?? 0;
      if (!w || isNaN(Number(w)) || Number(w) <= 0) {
        return 0;
      }
      return Math.min(1200, Math.max(80, Math.round(Number(w))));
    })(),
    cardHeight: (() => {
      const h =
        v.cardHeight !== undefined
          ? v.cardHeight
          : opcoes?.cardHeight !== undefined
          ? opcoes.cardHeight
          : v.blockHeight !== undefined
          ? v.blockHeight
          : opcoes?.blockHeight ?? 0;
      if (!h || isNaN(Number(h)) || Number(h) <= 0) {
        return 0;
      }
      return Math.min(800, Math.max(60, Math.round(Number(h))));
    })(),
    columns: (v.columns ?? opcoes?.columns ?? 'auto') as LayoutColumns,
    showStatusBadge:
      v.showStatusBadge !== undefined
        ? v.showStatusBadge
        : opcoes?.showStatusBadge !== undefined
        ? opcoes.showStatusBadge
        : true,
    fontFamily: (v.fontFamily ?? opcoes?.fontFamily ?? 'default') as FontFamily,
    fontSize: (v.fontSize ?? opcoes?.fontSize ?? 'md') as FontSize,
  };
}
