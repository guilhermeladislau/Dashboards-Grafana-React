import React from 'react';
import { css } from '@emotion/css';
import { MetricStatusLevel } from '../../types';

export interface BarraProgressoProps {
  percentual?: number;
  nivelStatus?: MetricStatusLevel;
  corStatus?: string;
}

export const BarraProgresso: React.FC<BarraProgressoProps> = ({
  percentual,
  nivelStatus,
  corStatus,
}) => {
  if (percentual === undefined) {
    return null;
  }

  const percentualSeguro = Math.max(0, Math.min(100, percentual));

  const trilhoProgresso = css`
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 6px;
  `;

  const obterGradiente = () => {
    if (nivelStatus === 'critical') {
      return 'linear-gradient(90deg, #f59e0b, #ef4444)';
    }
    if (nivelStatus === 'warning') {
      return 'linear-gradient(90deg, #6366f1, #f59e0b)';
    }
    return 'linear-gradient(90deg, #6366f1, #22c55e)';
  };

  const barraProgresso = css`
    height: 100%;
    border-radius: 4px;
    transition: width 0.4s ease-in-out;
    background: ${corStatus ? corStatus : obterGradiente()};
    width: ${percentualSeguro}%;
  `;

  return (
    <div className={trilhoProgresso}>
      <div className={barraProgresso} />
    </div>
  );
};

// Aliases para compatibilidade
export const MetricProgressBar = BarraProgresso;
