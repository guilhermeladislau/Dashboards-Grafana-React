import React from 'react';
import { MetricBlockItem, PanelOptions } from '../../types';
import { BlocoMetrica } from '../bloco/BlocoMetrica';
import { METADADOS_DISPOSITIVOS } from '../../utilitarios/preconfiguracoesDispositivos';

export interface BlocoServidorProps {
  item: MetricBlockItem;
  options: PanelOptions;
}

export const BlocoServidor: React.FC<BlocoServidorProps> = ({ item, options }) => {
  const meta = METADADOS_DISPOSITIVOS.servidor;

  return (
    <BlocoMetrica
      item={{
        ...item,
        icon: item.icon || meta.icone,
      }}
      options={options}
      etiquetaDispositivo={options.deviceName || '🖥️ SERVIDOR'}
      corDispositivo={meta.corDestaque}
    />
  );
};
