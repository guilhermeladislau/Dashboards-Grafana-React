import React, { useMemo } from 'react';
import { css } from '@emotion/css';
import { MetricDataPoint } from '../../types';

export interface GraficoTorreProps {
  percentual?: number;
  pontos?: MetricDataPoint[];
  corStatus?: string;
}

export const GraficoTorre: React.FC<GraficoTorreProps> = ({
  percentual = 50,
  pontos = [],
  corStatus = '#22c55e',
}) => {
  const barras = useMemo(() => {
    const numericos = pontos
      .map((p) => (typeof p.value === 'number' ? p.value : null))
      .filter((v): v is number => v !== null);

    // Se houver histórico suficiente, usa as últimas 10 leituras como colunas
    if (numericos.length >= 4) {
      const recorte = numericos.slice(-10);
      const min = Math.min(...recorte, 0);
      const max = Math.max(...recorte, 1);
      const intervalo = max - min || 1;
      return recorte.map((v) => ({
        altura: Math.max(18, Math.min(100, ((v - min) / intervalo) * 100)),
        ativo: true,
      }));
    }

    // Caso contrário, gera uma torre graduada de 10 níveis baseada no percentual
    const pct = Math.max(0, Math.min(100, percentual));
    const totalNiveis = 10;
    const niveisAtivos = Math.round((pct / 100) * totalNiveis);

    return Array.from({ length: totalNiveis }, (_, idx) => {
      const nivel = idx + 1;
      return {
        altura: 20 + idx * 8,
        ativo: nivel <= niveisAtivos || (idx === 0 && pct > 0),
      };
    });
  }, [percentual, pontos]);

  return (
    <div
      className={css`
        display: flex;
        align-items: flex-end;
        gap: 4px;
        height: 28px;
        width: 100%;
        margin: 4px 0 8px 0;
        padding: 2px 0;
      `}
    >
      {barras.map((b, i) => (
        <div
          key={i}
          className={css`
            flex: 1;
            height: ${b.altura}%;
            border-radius: 3px 3px 1px 1px;
            background: ${b.ativo ? corStatus : 'rgba(255, 255, 255, 0.08)'};
            opacity: ${b.ativo ? 0.9 : 0.35};
            transition: height 0.3s ease, background 0.3s ease;
          `}
        />
      ))}
    </div>
  );
};
