import React from 'react';
import { MetricBlockItem, PanelOptions } from '../../types';
import { BlocoMetrica } from '../bloco/BlocoMetrica';
import { METADADOS_DISPOSITIVOS } from '../../utilitarios/preconfiguracoesDispositivos';

export interface BlocoAccessPointProps {
  item: MetricBlockItem;
  options: PanelOptions;
}

export const BlocoAccessPoint: React.FC<BlocoAccessPointProps> = ({ item, options }) => {
  const meta = METADADOS_DISPOSITIVOS.access_point;

  return (
    <BlocoMetrica
      item={{
        ...item,
        icon: item.icon || meta.icone,
      }}
      options={options}
      etiquetaDispositivo={options.deviceName || '📡 ACCESS POINT (WI-FI)'}
      corDispositivo={meta.corDestaque}
    />
  );
};
