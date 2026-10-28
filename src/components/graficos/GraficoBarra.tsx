import React from 'react';
import { css } from '@emotion/css';
import { MetricStatusLevel } from '../../types';

export interface GraficoBarraProps {
  percentual?: number;
  nivelStatus?: MetricStatusLevel;
  corStatus?: string;
}

export const GraficoBarra: React.FC<GraficoBarraProps> = ({
  percentual = 0,
  nivelStatus,
  corStatus,
}) => {
  const percentualSeguro = Math.max(0, Math.min(100, percentual));

  const obterGradiente = () => {
    if (nivelStatus === 'critical') {
      return 'linear-gradient(90deg, #f59e0b, #ef4444)';
    }
    if (nivelStatus === 'warning') {
      return 'linear-gradient(90deg, #6366f1, #f59e0b)';
    }
    if (corStatus) {
      return `linear-gradient(90deg, #6366f1, ${corStatus})`;
    }
    return 'linear-gradient(90deg, #6366f1, #22c55e)';
  };

  return (
    <div
      className={css`
        width: 100%;
        margin: 6px 0 8px 0;
      `}
    >
      <div
        className={css`
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        `}
      >
        <div
          className={css`
            height: 100%;
            border-radius: 6px;
            transition: width 0.4s ease-in-out;
            background: ${obterGradiente()};
            width: ${percentualSeguro}%;
            box-shadow: 0 0 8px ${corStatus || '#22c55e'}66;
          `}
        />
      </div>
    </div>
  );
};
