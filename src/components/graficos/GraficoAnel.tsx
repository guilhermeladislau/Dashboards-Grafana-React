import React from 'react';
import { css } from '@emotion/css';

export interface GraficoAnelProps {
  percentual?: number;
  corStatus?: string;
  tamanho?: number;
}

export const GraficoAnel: React.FC<GraficoAnelProps> = ({
  percentual = 0,
  corStatus = '#38bdf8',
  tamanho = 54,
}) => {
  const pct = Math.max(0, Math.min(100, percentual));
  const espessura = Math.max(5, Math.round(tamanho * 0.12));
  const raio = (tamanho - espessura) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const deslocamento = circunferencia - (pct / 100) * circunferencia;

  return (
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
      <svg
        width={tamanho}
        height={tamanho}
        viewBox={`0 0 ${tamanho} ${tamanho}`}
        className={css`
          filter: drop-shadow(0 0 4px ${corStatus}55);
        `}
      >
        {/* Trilha do anel */}
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={espessura}
        />
        {/* Linha guia interna sutil */}
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={Math.max(2, raio - espessura / 2 - 2)}
          fill="none"
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth="1"
          strokeDasharray="2,3"
        />
        {/* Anel preenchido */}
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
          style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div
        className={css`
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        `}
      >
        <span
          className={css`
            font-size: ${Math.max(9, Math.round(tamanho * 0.2))}px;
            font-weight: 800;
            color: ${corStatus};
            line-height: 1;
          `}
        >
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  );
};
