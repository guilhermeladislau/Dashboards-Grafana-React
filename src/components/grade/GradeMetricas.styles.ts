import { css } from '@emotion/css';
import { PanelOptions } from '../../types';
import { obterDimensoesBloco } from '../../estilos';

export const obterColunasGrade = (
  colunas: PanelOptions['columns'],
  larguraMinimaGrade = '180px'
) => {
  switch (colunas) {
    case '1':
      return '1fr';
    case '2':
      return 'repeat(2, minmax(0, 1fr))';
    case '3':
      return 'repeat(3, minmax(0, 1fr))';
    case '4':
      return 'repeat(4, minmax(0, 1fr))';
    case 'auto':
    default:
      return `repeat(auto-fill, minmax(${larguraMinimaGrade}, 1fr))`;
  }
};

export const obterEstilosGrade = (opcoes: PanelOptions) => {
  const altura = opcoes.cardHeight && opcoes.cardHeight > 0 ? opcoes.cardHeight : opcoes.blockHeight;
  const dimensoes = obterDimensoesBloco(opcoes.blockSize, altura, opcoes.cardWidth);
  return css`
    display: grid;
    grid-template-columns: ${obterColunasGrade(opcoes.columns, dimensoes.larguraMinimaGrade)};
    gap: 12px;
    width: 100%;
  `;
};

// Aliases para compatibilidade
export const getGridTemplateColumns = obterColunasGrade;
export const getGridStyles = obterEstilosGrade;
