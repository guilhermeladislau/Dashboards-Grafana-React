import React, { useId, useMemo } from 'react';
import { css } from '@emotion/css';
import { MetricDataPoint } from '../../types';

export interface GraficoAreaProps {
  pontos: MetricDataPoint[];
  corLinha: string;
  percentual?: number;
}

export const GraficoArea: React.FC<GraficoAreaProps> = ({
  pontos,
  corLinha,
  percentual = 50,
}) => {
  const idGradiente = useId();

  const { linhaCoords, areaCoords } = useMemo(() => {
    const numericos = pontos
      .map((p) => (typeof p.value === 'number' ? p.value : null))
      .filter((v): v is number => v !== null);

    const valores =
      numericos.length >= 2
        ? numericos
        : [
            Math.max(5, percentual * 0.85),
            Math.max(5, percentual * 0.92),
            Math.max(5, percentual * 0.88),
            Math.max(5, percentual),
          ];

    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const intervalo = max - min || 1;
    const largura = 100;
    const altura = 26;

    const coords = valores.map((val, idx) => {
      const x = (idx / (valores.length - 1)) * largura;
      const y = altura - ((val - min) / intervalo) * (altura - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const linha = coords.join(' ');
    const area = `0,${altura} ${linha} ${largura},${altura}`;

    return { linhaCoords: linha, areaCoords: area };
  }, [pontos, percentual]);

  return (
    <div
      className={css`
        width: 100%;
        height: 28px;
        margin: 4px 0 6px 0;
      `}
    >
      <svg
        className={css`
          width: 100%;
          height: 100%;
          overflow: visible;
        `}
        viewBox="0 0 100 26"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={idGradiente} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={corLinha} stopOpacity="0.4" />
            <stop offset="100%" stopColor={corLinha} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon fill={`url(#${idGradiente})`} points={areaCoords} />
        <polyline
          fill="none"
          stroke={corLinha}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={linhaCoords}
        />
      </svg>
    </div>
  );
};
