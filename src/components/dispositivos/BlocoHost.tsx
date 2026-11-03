import React from 'react';
import { MetricBlockItem, PanelOptions } from '../../types';
import { BlocoMetrica } from '../bloco/BlocoMetrica';
import { METADADOS_DISPOSITIVOS } from '../../utilitarios/preconfiguracoesDispositivos';

export interface BlocoHostProps {
  item: MetricBlockItem;
  options: PanelOptions;
}

export const BlocoHost: React.FC<BlocoHostProps> = ({ item, options }) => {
  const meta = METADADOS_DISPOSITIVOS.host;

  return (
    <BlocoMetrica
      item={{
        ...item,
        icon: item.icon || meta.icone,
      }}
      options={options}
      etiquetaDispositivo={options.deviceName || '🖧 HOST / HIPERVISOR'}
      corDispositivo={meta.corDestaque}
    />
  );
};
