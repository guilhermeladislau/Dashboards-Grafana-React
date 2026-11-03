import { MetricStatusLevel } from '../types';

export interface ResultadoMetricaAvaliada {
  percentual: number;
  valorExibicao: string;
  nivelStatus: MetricStatusLevel;
  tagStatus: string;
  subTexto: string;
  corStatus: string;
}

/**
 * Avalia um percentual de USO (quanto maior, mais crítico)
 */
export function avaliarUsoPercentual(
  val: number,
  limiarAtencao: number,
  limiarCritico: number,
  rotuloContexto = 'Operação Saudável'
): ResultadoMetricaAvaliada {
  const percentual = Math.max(0, Math.min(100, val));
  const valorExibicao = `${percentual.toFixed(1)}%`;

  if (percentual < limiarAtencao) {
    return {
      percentual,
      valorExibicao,
      nivelStatus: 'ok',
      tagStatus: 'NORMAL',
      subTexto: `${rotuloContexto} (< ${limiarAtencao}%)`,
      corStatus: '#22c55e',
    };
  }
  if (percentual < limiarCritico) {
    return {
      percentual,
      valorExibicao,
      nivelStatus: 'warning',
      tagStatus: 'ATENÇÃO',
      subTexto: `Carga Elevada (${limiarAtencao}-${limiarCritico}%)`,
      corStatus: '#f59e0b',
    };
  }
  return {
    percentual,
    valorExibicao,
    nivelStatus: 'critical',
    tagStatus: 'CRÍTICO',
    subTexto: `Sobrecarga Crítica (> ${limiarCritico}%)`,
    corStatus: '#ef4444',
  };
}

/**
 * Avalia um percentual LIVRE (quanto menor o espaço/memória livre, mais crítico)
 */
export function avaliarLivrePercentual(
  val: number,
  limiarUsoAtencao: number,
  limiarUsoCritico: number,
  rotuloContexto = 'Espaço Livre Disponível'
): ResultadoMetricaAvaliada {
  const percentualLivre = Math.max(0, Math.min(100, val));
  const usoEquivalente = 100 - percentualLivre;
  const valorExibicao = `${percentualLivre.toFixed(1)}%`;

  if (usoEquivalente >= limiarUsoCritico) {
    return {
      percentual: percentualLivre,
      valorExibicao,
      nivelStatus: 'critical',
      tagStatus: 'POUCO ESPAÇO',
      subTexto: `Reserva Crítica (< ${(100 - limiarUsoCritico).toFixed(0)}% livre)`,
      corStatus: '#ef4444',
    };
  }
  if (usoEquivalente >= limiarUsoAtencao) {
    return {
      percentual: percentualLivre,
      valorExibicao,
      nivelStatus: 'warning',
      tagStatus: 'ATENÇÃO',
      subTexto: `Espaço Reduzido (< ${(100 - limiarUsoAtencao).toFixed(0)}% livre)`,
      corStatus: '#f59e0b',
    };
  }
  return {
    percentual: percentualLivre,
    valorExibicao,
    nivelStatus: 'ok',
    tagStatus: 'DISPONÍVEL',
    subTexto: rotuloContexto,
    corStatus: '#22c55e',
  };
}

// Aliases para compatibilidade
export const evaluateUsagePct = (
  val: number,
  warn: number,
  crit: number,
  ctx?: string
) => {
  const r = avaliarUsoPercentual(val, warn, crit, ctx);
  return {
    percentage: r.percentual,
    displayValue: r.valorExibicao,
    statusLevel: r.nivelStatus,
    statusBadge: r.tagStatus,
    subText: r.subTexto,
    statusColor: r.corStatus,
  };
};

export const evaluateFreePct = (
  val: number,
  warn: number,
  crit: number,
  ctx?: string
) => {
  const r = avaliarLivrePercentual(val, warn, crit, ctx);
  return {
    percentage: r.percentual,
    displayValue: r.valorExibicao,
    statusLevel: r.nivelStatus,
    statusBadge: r.tagStatus,
    subText: r.subTexto,
    statusColor: r.corStatus,
  };
};
