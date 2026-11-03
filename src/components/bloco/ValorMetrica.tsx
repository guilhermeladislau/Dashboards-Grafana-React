import React from 'react';
import { css } from '@emotion/css';
import { MetricStatusLevel } from '../../types';

export interface ValorMetricaProps {
  valor: string;
  tamanhoFonte?: string;
  nivelStatus?: MetricStatusLevel;
  corStatus?: string;
  corTexto?: string;
  corPadraoTema: string;
}

export const ValorMetrica: React.FC<ValorMetricaProps> = ({
  valor,
  tamanhoFonte = '26px',
  nivelStatus,
  corStatus,
  corTexto,
  corPadraoTema,
}) => {
  const estadoAlerta = nivelStatus === 'critical' || nivelStatus === 'offline';
  const cor = estadoAlerta ? corStatus : corTexto || corPadraoTema;

  const estiloValor = css`
    font-size: ${tamanhoFonte};
    font-weight: 800;
    line-height: 1.1;
    color: ${cor};
    letter-spacing: -0.02em;
  `;

  return (
    <div
      className={css`
        display: flex;
        align-items: baseline;
        gap: 6px;
        margin: 4px 0 8px 0;
      `}
    >
      <span className={estiloValor}>{valor}</span>
    </div>
  );
};

// Aliases para compatibilidade
export const MetricCardValue = ValorMetrica;
