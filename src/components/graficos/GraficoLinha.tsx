import React, { useMemo } from 'react';
import { css } from '@emotion/css';
import { MetricDataPoint } from '../../types';

export interface GraficoLinhaProps {
  pontos: MetricDataPoint[];
  corLinha: string;
  percentual?: number;
  altura?: number;
}

export const GraficoLinha: React.FC<GraficoLinhaProps> = ({
  pontos,
  corLinha,
  percentual = 50,
  altura = 28,
}) => {
  const { coords, ultimoPonto } = useMemo(() => {
    const numericos = pontos
      .map((p) => (typeof p.value === 'number' ? p.value : null))
      .filter((v): v is number => v !== null);

    const valores =
      numericos.length >= 2
        ? numericos
        : [
            Math.max(5, percentual * 0.88),
            Math.max(5, percentual * 0.94),
            Math.max(5, percentual * 0.9),
            Math.max(5, percentual),
          ];

    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const intervalo = max - min || 1;
    const larguraSvg = 100;
    const alturaSvg = altura;

    const lista = valores.map((val, idx) => {
      const x = (idx / (valores.length - 1)) * larguraSvg;
      const y = alturaSvg - ((val - min) / intervalo) * (alturaSvg - 8) - 4;
      return { x, y, stringCoord: `${x.toFixed(1)},${y.toFixed(1)}` };
    });

    const linha = lista.map((p) => p.stringCoord).join(' ');
    const ultimo = lista[lista.length - 1];

    return { coords: linha, ultimoPonto: ultimo };
  }, [pontos, percentual, altura]);

  return (
    <div
      className={css`
        width: 100%;
        height: ${altura}px;
        margin: 4px 0 6px 0;
        position: relative;
      `}
    >
      <svg
        className={css`
          width: 100%;
          height: 100%;
          overflow: visible;
        `}
        viewBox={`0 0 100 ${altura}`}
        preserveAspectRatio="none"
      >
        {/* Linha guia de base */}
        <line
          x1="0"
          y1={altura - 2}
          x2="100"
          y2={altura - 2}
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
        />

        {/* Linha principal */}
        <polyline
          fill="none"
          stroke={corLinha}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />

        {/* Ponto indicador na leitura atual */}
        {ultimoPonto && (
          <>
            <circle
              cx={ultimoPonto.x}
              cy={ultimoPonto.y}
              r="4"
              fill={corLinha}
              opacity="0.3"
            />
            <circle
              cx={ultimoPonto.x}
              cy={ultimoPonto.y}
              r="2.5"
              fill="#ffffff"
            />
          </>
        )}
      </svg>
    </div>
  );
};
