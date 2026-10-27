import React from 'react';
import { css } from '@emotion/css';
import { MetricBlockItem, PanelOptions } from '../types';
import { MetricCard } from './MetricCard';

interface MetricGridProps {
  items: MetricBlockItem[];
  options: PanelOptions;
}

const getGridTemplateColumns = (columns: PanelOptions['columns']) => {
  switch (columns) {
    case '1':
      return '1fr';
    case '2':
      return 'repeat(2, minmax(0, 1fr))';
    case '3':
      return 'repeat(3, minmax(0, 1fr))';
    case '4':
      return 'repeat(4, minmax(0, 1fr))';
    case 'auto':
    default:
      return 'repeat(auto-fit, minmax(180px, 1fr))';
  }
};

export const MetricGrid: React.FC<MetricGridProps> = ({ items, options }) => {
  const gridStyle = css`
    display: grid;
    grid-template-columns: ${getGridTemplateColumns(options.columns)};
    gap: 12px;
    width: 100%;
  `;

  return (
    <div className={gridStyle}>
      {items.map((item) => (
        <MetricCard key={item.id} item={item} options={options} />
      ))}
    </div>
  );
};
