import React from 'react';
import { MetricBlockItem, PanelOptions } from '../../types';
import { BlocoMetrica } from '../bloco/BlocoMetrica';
import { METADADOS_DISPOSITIVOS } from '../../utilitarios/preconfiguracoesDispositivos';

export interface BlocoVMProps {
  item: MetricBlockItem;
  options: PanelOptions;
}

export const BlocoVM: React.FC<BlocoVMProps> = ({ item, options }) => {
  const meta = METADADOS_DISPOSITIVOS.vm;

  return (
    <BlocoMetrica
      item={{
        ...item,
        icon: item.icon || meta.icone,
      }}
      options={options}
      etiquetaDispositivo={options.deviceName || '📦 MÁQUINA VIRTUAL (VM)'}
      corDispositivo={meta.corDestaque}
    />
  );
};
