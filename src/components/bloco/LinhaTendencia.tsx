import React, { useMemo } from 'react';
import { css } from '@emotion/css';
import { MetricDataPoint } from '../../types';

export interface LinhaTendenciaProps {
  pontos: MetricDataPoint[];
  corLinha: string;
}

const estiloWrapperLinha = css`
  width: 100%;
  height: 24px;
  margin-top: 4px;
  margin-bottom: 6px;
`;

const estiloSvgLinha = css`
  width: 100%;
  height: 100%;
  overflow: visible;
`;

export const LinhaTendencia: React.FC<LinhaTendenciaProps> = ({ pontos, corLinha }) => {
  const pontosFormatados = useMemo(() => {
    if (pontos.length < 2) {
      return '';
    }

    const pontosNumericos = pontos
      .map((p) => (typeof p.value === 'number' ? p.value : null))
      .filter((v): v is number => v !== null);

    if (pontosNumericos.length < 2) {
      return '';
    }

    const min = Math.min(...pontosNumericos);
    const max = Math.max(...pontosNumericos);
    const intervalo = max - min || 1;
    const largura = 100;
    const altura = 20;

    return pontosNumericos
      .map((val, idx) => {
        const x = (idx / (pontosNumericos.length - 1)) * largura;
        const y = altura - ((val - min) / intervalo) * (altura - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [pontos]);

  if (!pontosFormatados) {
    return null;
  }

  return (
    <div className={estiloWrapperLinha}>
      <svg className={estiloSvgLinha} viewBox="0 0 100 20" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={corLinha}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pontosFormatados}
        />
      </svg>
    </div>
  );
};

// Aliases para compatibilidade
export const MetricSparkline = LinhaTendencia;
