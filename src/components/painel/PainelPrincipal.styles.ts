import { css } from '@emotion/css';
import { PanelOptions } from '../../types';
import { obterFamiliaFonteResolvida } from '../../estilos';

export const obterEstilosPainel = (opcoes: PanelOptions) => {
  const familiaFonte = obterFamiliaFonteResolvida(opcoes.fontFamily);

  return {
    wrapper: css`
      width: 100%;
      height: 100%;
      position: relative;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px;
      font-family: ${familiaFonte};
      background: ${opcoes.backgroundColor || 'transparent'};
      box-sizing: border-box;
    `,
  };
};

// Aliases para compatibilidade
export const getPanelStyles = obterEstilosPainel;
