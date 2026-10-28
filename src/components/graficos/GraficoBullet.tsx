import React from 'react';
import { css } from '@emotion/css';

export interface GraficoBulletProps {
  percentual?: number;
  corStatus?: string;
  limiarAtencao?: number;
  limiarCritico?: number;
}

export const GraficoBullet: React.FC<GraficoBulletProps> = ({
  percentual = 0,
  corStatus = '#22c55e',
  limiarAtencao = 70,
  limiarCritico = 85,
}) => {
  const pct = Math.max(0, Math.min(100, percentual));
  const wWarning = Math.max(0, Math.min(100, limiarAtencao));
  const wCritical = Math.max(0, Math.min(100, limiarCritico));

  return (
    <div
      className={css`
        width: 100%;
        margin: 6px 0 8px 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      `}
    >
      <div
        className={css`
          position: relative;
          width: 100%;
          height: 14px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          overflow: visible;
        `}
      >
        {/* Faixa Zona Normal (0 até Warning) */}
        <div
          className={css`
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: ${wWarning}%;
            background: rgba(34, 197, 94, 0.12);
            border-radius: 4px 0 0 4px;
          `}
        />

        {/* Faixa Zona Atenção (Warning até Critical) */}
        <div
          className={css`
            position: absolute;
            left: ${wWarning}%;
            top: 0;
            height: 100%;
            width: ${Math.max(0, wCritical - wWarning)}%;
            background: rgba(245, 158, 11, 0.16);
          `}
        />

        {/* Faixa Zona Crítica (Critical até 100%) */}
        <div
          className={css`
            position: absolute;
            left: ${wCritical}%;
            top: 0;
            height: 100%;
            width: ${Math.max(0, 100 - wCritical)}%;
            background: rgba(239, 68, 68, 0.18);
            border-radius: 0 4px 4px 0;
          `}
        />

        {/* Barra de Progresso Real (Medição Atual) */}
        <div
          className={css`
            position: absolute;
            left: 0;
            top: 3px;
            height: 8px;
            width: ${pct}%;
            background: ${corStatus};
            border-radius: 2px;
            box-shadow: 0 0 6px ${corStatus}88;
            transition: width 0.4s ease-in-out;
            z-index: 2;
          `}
        />

        {/* Marcador Vertical: Limiar Warning */}
        <div
          className={css`
            position: absolute;
            left: ${wWarning}%;
            top: -2px;
            bottom: -2px;
            width: 2px;
            background: #f59e0b;
            z-index: 3;
            box-shadow: 0 0 4px #f59e0b;
          `}
          title={`Limiar de Atenção: ${wWarning}%`}
        />

        {/* Marcador Vertical: Limiar Critical */}
        <div
          className={css`
            position: absolute;
            left: ${wCritical}%;
            top: -2px;
            bottom: -2px;
            width: 2px;
            background: #ef4444;
            z-index: 3;
            box-shadow: 0 0 4px #ef4444;
          `}
          title={`Limiar Crítico: ${wCritical}%`}
        />
      </div>

      {/* Legenda sutil dos limiares */}
      <div
        className={css`
          display: flex;
          justify-content: space-between;
          font-size: 8px;
          color: rgba(255, 255, 255, 0.4);
          font-weight: 600;
          padding: 0 2px;
        `}
      >
        <span>0%</span>
        <span>{wWarning}% (Aviso)</span>
        <span>{wCritical}% (Crítico)</span>
        <span>100%</span>
      </div>
    </div>
  );
};
