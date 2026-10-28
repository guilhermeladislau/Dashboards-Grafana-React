import React from 'react';
import { MetricBlockItem, PanelOptions } from '../../types';
import { BlocoConsolidadoDispositivo } from '../dispositivos/BlocoConsolidadoDispositivo';
import { SeletorBlocoDispositivo } from '../dispositivos/SeletorBlocoDispositivo';
import { obterEstilosGrade } from './GradeMetricas.styles';

export interface GradeMetricasProps {
  items: MetricBlockItem[];
  options: PanelOptions;
}

export const GradeMetricas: React.FC<GradeMetricasProps> = ({ items, options }) => {
  // Limita a quantidade de dispositivos/métricas exibidas se configurado
  const itensExibidos =
    options.maxDevices && options.maxDevices > 0
      ? items.slice(0, options.maxDevices)
      : items;

  if (options.cardDisplayMode === 'consolidado') {
    return <BlocoConsolidadoDispositivo items={itensExibidos} options={options} totalOriginal={items.length} />;
  }

  const estiloGrade = obterEstilosGrade(options);

  return (
    <div className={estiloGrade}>
      {itensExibidos.map((item) => (
        <SeletorBlocoDispositivo key={item.id} item={item} options={options} />
      ))}
    </div>
  );
};

// Aliases para compatibilidade
export const MetricGrid = GradeMetricas;
export type MetricGridProps = GradeMetricasProps;
