import React from 'react';
import { css } from '@emotion/css';

export interface RodapeBlocoProps {
  subTexto?: string;
  corStatus?: string;
  corReserva?: string;
}

export const RodapeBloco: React.FC<RodapeBlocoProps> = ({
  subTexto,
  corStatus,
  corReserva,
}) => {
  if (!subTexto) {
    return null;
  }

  const estiloRodape = css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    padding-top: 6px;
    font-size: 10px;
  `;

  const estiloSubTexto = css`
    color: ${corStatus || corReserva || 'inherit'};
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `;

  return (
    <div className={estiloRodape}>
      <span className={estiloSubTexto}>{subTexto}</span>
    </div>
  );
};

// Aliases para compatibilidade
export const MetricCardFooter = RodapeBloco;
