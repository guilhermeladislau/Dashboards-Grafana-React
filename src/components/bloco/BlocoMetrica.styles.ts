import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { MetricBlockItem, PanelOptions } from '../../types';
import {
  obterCoresPadraoBloco,
  obterDimensoesBloco,
  obterFamiliaFonteResolvida,
  obterTamanhoResolvido,
} from '../../estilos';

export const obterEstilosBloco = (
  tema: GrafanaTheme2,
  opcoes: PanelOptions,
  item: MetricBlockItem
) => {
  const tamanhoAtual = obterTamanhoResolvido(opcoes.fontSize);
  const dimensoesBloco = obterDimensoesBloco(opcoes.blockSize, opcoes.blockHeight);
  const familiaFonte = obterFamiliaFonteResolvida(opcoes.fontFamily);
  const padroes = obterCoresPadraoBloco(tema);

  return {
    bloco: css`
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: ${opcoes.cardBackgroundColor || padroes.fundoPadrao};
      color: ${opcoes.textColor || padroes.textoPadrao};
      border: 1px solid ${opcoes.borderColor || padroes.bordaPadrao};
      border-radius: 14px;
      padding: ${dimensoesBloco.preenchimento};
      font-family: ${familiaFonte};
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
      transition: all 0.25s ease-in-out;
      overflow: hidden;
      min-height: ${dimensoesBloco.alturaMinima};
      position: relative;

      &:hover {
        border-color: ${item.statusColor || '#818cf8'};
        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
        transform: translateY(-2px);
      }
    `,
    tamanhoAtual,
    dimensoesBloco,
    familiaFonte,
  };
};

// Aliases para compatibilidade
export const getCardStyles = obterEstilosBloco;
