import React from 'react';
import { css } from '@emotion/css';

export interface GraficoArcoProps {
  percentual?: number;
  corStatus?: string;
  tamanho?: number;
}

export const GraficoArco: React.FC<GraficoArcoProps> = ({
  percentual = 0,
  corStatus = '#22c55e',
  tamanho = 64,
}) => {
  const pct = Math.max(0, Math.min(100, percentual));
  const espessura = Math.max(5, Math.round(tamanho * 0.12));
  const largura = tamanho;
  const altura = Math.round(tamanho * 0.65);
  const cx = largura / 2;
  const cy = altura - 4;
  const r = (largura - espessura * 2) / 2;
  const comprimentoArco = Math.PI * r;
  const deslocamento = comprimentoArco * (1 - pct / 100);

  // Caminho do semicírculo da esquerda (180°) até a direita (0°)
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <div
      className={css`
        position: relative;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      `}
    >
      <svg
        width={largura}
        height={altura}
        viewBox={`0 0 ${largura} ${altura}`}
        className={css`
          overflow: visible;
        `}
      >
        {/* Trilha de fundo */}
        <path
          d={d}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={espessura}
          strokeLinecap="round"
        />

        {/* Arco de progresso */}
        <path
          d={d}
          fill="none"
          stroke={corStatus}
          strokeWidth={espessura}
          strokeLinecap="round"
          strokeDasharray={comprimentoArco}
          strokeDashoffset={deslocamento}
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
      </svg>

      <span
        className={css`
          position: absolute;
          bottom: 2px;
          font-size: ${Math.max(9, Math.round(tamanho * 0.18))}px;
          font-weight: 800;
          color: ${corStatus};
        `}
      >
        {Math.round(pct)}%
      </span>
    </div>
  );
};
