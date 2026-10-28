import React from 'react';
import { css } from '@emotion/css';

export interface GraficoTermometroProps {
  percentual?: number;
  corStatus?: string;
  altura?: number;
}

export const GraficoTermometro: React.FC<GraficoTermometroProps> = ({
  percentual = 0,
  corStatus = '#ef4444',
  altura = 54,
}) => {
  const pct = Math.max(0, Math.min(100, percentual));
  const largura = 32;
  const raioBulbo = 8;
  const larguraTubo = 6;
  const alturaTubo = altura - raioBulbo * 2;
  const nivelLiquido = (pct / 100) * alturaTubo;

  return (
    <div
      className={css`
        position: relative;
        width: ${largura}px;
        height: ${altura}px;
        display: flex;
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
        {/* Traços de escala na lateral direita */}
        {[0.25, 0.5, 0.75].map((frac, idx) => (
          <line
            key={idx}
            x1={largura / 2 + larguraTubo / 2 + 2}
            y1={altura - raioBulbo * 2 - frac * alturaTubo}
            x2={largura / 2 + larguraTubo / 2 + 6}
            y2={altura - raioBulbo * 2 - frac * alturaTubo}
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1"
          />
        ))}

        {/* Fundo do Tubo (Vazio) */}
        <rect
          x={largura / 2 - larguraTubo / 2}
          y={4}
          width={larguraTubo}
          height={alturaTubo}
          rx={larguraTubo / 2}
          fill="rgba(255, 255, 255, 0.1)"
        />

        {/* Fundo do Bulbo */}
        <circle
          cx={largura / 2}
          cy={altura - raioBulbo}
          r={raioBulbo}
          fill="rgba(255, 255, 255, 0.1)"
        />

        {/* Líquido do Tubo (Preenchimento proporcional) */}
        <rect
          x={largura / 2 - larguraTubo / 2}
          y={altura - raioBulbo * 2 - nivelLiquido}
          width={larguraTubo}
          height={nivelLiquido + 4}
          rx={larguraTubo / 2}
          fill={corStatus}
          style={{ transition: 'all 0.4s ease-in-out' }}
        />

        {/* Líquido do Bulbo */}
        <circle
          cx={largura / 2}
          cy={altura - raioBulbo}
          r={raioBulbo - 1.5}
          fill={corStatus}
          style={{ filter: `drop-shadow(0 0 4px ${corStatus}88)` }}
        />

        {/* Brilho no bulbo */}
        <circle
          cx={largura / 2 - 2.5}
          cy={altura - raioBulbo - 2.5}
          r="2"
          fill="#ffffff"
          opacity="0.6"
        />
      </svg>
    </div>
  );
};
