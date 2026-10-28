import { GrafanaTheme2 } from '@grafana/data';
import { BlockSize, PanelOptions } from '../types';

export const mapaFontes = {
  default: 'inherit',
  Inter: '"Inter", sans-serif',
  Roboto: '"Roboto", sans-serif',
  'Open Sans': '"Open Sans", sans-serif',
  Montserrat: '"Montserrat", sans-serif',
  monospace: 'monospace',
};

export const mapaTamanhos = {
  sm: { titulo: '10px', valor: '20px', preenchimento: '10px 12px' },
  md: { titulo: '11px', valor: '26px', preenchimento: '12px 16px' },
  lg: { titulo: '13px', valor: '32px', preenchimento: '16px 20px' },
  xl: { titulo: '15px', valor: '38px', preenchimento: '20px 24px' },
};

/**
 * Configurações de dimensão do bloco (card) de monitoramento
 */
export const mapaTamanhosBloco = {
  sm: {
    alturaMinima: '90px',
    preenchimento: '8px 12px',
    larguraMinimaGrade: '140px',
    tamanhoCircular: 44,
    alturaGrafico: 20,
    espacoInterno: '6px',
  },
  md: {
    alturaMinima: '120px',
    preenchimento: '12px 16px',
    larguraMinimaGrade: '180px',
    tamanhoCircular: 54,
    alturaGrafico: 28,
    espacoInterno: '10px',
  },
  lg: {
    alturaMinima: '165px',
    preenchimento: '16px 20px',
    larguraMinimaGrade: '240px',
    tamanhoCircular: 68,
    alturaGrafico: 38,
    espacoInterno: '14px',
  },
  xl: {
    alturaMinima: '220px',
    preenchimento: '20px 24px',
    larguraMinimaGrade: '300px',
    tamanhoCircular: 84,
    alturaGrafico: 52,
    espacoInterno: '18px',
  },
};

export const obterFamiliaFonteResolvida = (familiaFonte?: PanelOptions['fontFamily']): string => {
  return mapaFontes[familiaFonte || 'default'] || 'inherit';
};

export const obterTamanhoResolvido = (tamanhoFonte?: PanelOptions['fontSize']) => {
  return mapaTamanhos[tamanhoFonte || 'md'] || mapaTamanhos.md;
};

export const obterDimensoesBloco = (
  tamanhoBloco?: BlockSize,
  alturaCustom?: number
) => {
  const config = mapaTamanhosBloco[tamanhoBloco || 'md'] || mapaTamanhosBloco.md;
  return {
    ...config,
    alturaMinima:
      alturaCustom && alturaCustom > 0 ? `${alturaCustom}px` : config.alturaMinima,
  };
};

export const obterCoresPadraoBloco = (tema: GrafanaTheme2) => {
  const fundoPadrao = tema.isDark
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';

  const bordaPadrao = tema.isDark ? 'rgba(99, 102, 241, 0.35)' : 'rgba(99, 102, 241, 0.2)';
  const textoPadrao = tema.isDark ? '#f8fafc' : '#0f172a';

  return {
    fundoPadrao,
    bordaPadrao,
    textoPadrao,
  };
};

// Aliases para compatibilidade retroativa
export const fontMap = mapaFontes;
export const sizeMap = mapaTamanhos;
export const getResolvedFontFamily = obterFamiliaFonteResolvida;
export const getResolvedSize = obterTamanhoResolvido;
export const getCardDefaultColors = obterCoresPadraoBloco;
