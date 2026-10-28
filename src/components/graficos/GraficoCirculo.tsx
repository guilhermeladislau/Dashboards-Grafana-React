import React from 'react';
import { css } from '@emotion/css';

export interface GraficoCirculoProps {
  percentual?: number;
  corStatus?: string;
  tamanho?: number;
}

export const GraficoCirculo: React.FC<GraficoCirculoProps> = ({
  percentual = 0,
  corStatus = '#22c55e',
  tamanho = 54,
}) => {
  const pct = Math.max(0, Math.min(100, percentual));
  const espessura = 6;
  const raio = (tamanho - espessura) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const deslocamento = circunferencia - (pct / 100) * circunferencia;

  return (
    <div
      className={css`
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 12px;
        margin: 4px 0 8px 0;
      `}
    >
      <div
        className={css`
          position: relative;
          width: ${tamanho}px;
          height: ${tamanho}px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        `}
      >
        <svg width={tamanho} height={tamanho} viewBox={`0 0 ${tamanho} ${tamanho}`}>
          <circle
            cx={tamanho / 2}
            cy={tamanho / 2}
            r={raio}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={espessura}
          />
          <circle
            cx={tamanho / 2}
            cy={tamanho / 2}
            r={raio}
            fill="none"
            stroke={corStatus}
            strokeWidth={espessura}
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            strokeDashoffset={deslocamento}
            transform={`rotate(-90 ${tamanho / 2} ${tamanho / 2})`}
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <span
          className={css`
            position: absolute;
            font-size: 10px;
            font-weight: 800;
            color: ${corStatus};
          `}
        >
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  );
};
