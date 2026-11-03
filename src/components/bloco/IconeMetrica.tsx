import React from 'react';
import { css } from '@emotion/css';

export interface IconeMetricaProps {
  icone?: string;
  titulo: string;
  categoria: string;
}

export const obterIconeMetrica = (titulo: string, categoria: string): string => {
  const t = titulo.toLowerCase();
  if (t.includes('cpu') || t.includes('processador')) {
    return '📈';
  }
  if (t.includes('memory') || t.includes('memória') || t.includes('ram')) {
    return '🧠';
  }
  if (t.includes('disk') || t.includes('disco') || t.includes('datastore') || t.includes('volume')) {
    return '💿';
  }
  if (t.includes('agent')) {
    return '🛡️';
  }
  if (t.includes('ping') || t.includes('icmp')) {
    return '🌐';
  }
  if (t.includes('uptime')) {
    return '⏱️';
  }
  if (t.includes('host') || t.includes('nome')) {
    return '🏷️';
  }
  if (t.includes('vm') || t.includes('guest') || t.includes('máquina')) {
    return '📦';
  }
  if (t.includes('traffic') || t.includes('tráfego') || t.includes('in') || t.includes('out') || t.includes('byte')) {
    return '⚡';
  }
  if (categoria === 'status') {
    return '📡';
  }
  return '📊';
};

const estiloCaixaIcone = css`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
`;

export const IconeMetrica: React.FC<IconeMetricaProps> = ({ icone, titulo, categoria }) => {
  const iconeResolvido = icone || obterIconeMetrica(titulo, categoria);

  return <div className={estiloCaixaIcone}>{iconeResolvido}</div>;
};

// Aliases para compatibilidade
export const MetricIcon = IconeMetrica;
export const getMetricIcon = obterIconeMetrica;
