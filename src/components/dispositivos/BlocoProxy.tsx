import React from 'react';
import { MetricBlockItem, PanelOptions } from '../../types';
import { BlocoMetrica } from '../bloco/BlocoMetrica';
import { METADADOS_DISPOSITIVOS } from '../../utilitarios/preconfiguracoesDispositivos';

export interface BlocoProxyProps {
  item: MetricBlockItem;
  options: PanelOptions;
}

export const BlocoProxy: React.FC<BlocoProxyProps> = ({ item, options }) => {
  const meta = METADADOS_DISPOSITIVOS.proxy;

  return (
    <BlocoMetrica
      item={{
        ...item,
        icon: item.icon || meta.icone,
      }}
      options={options}
      etiquetaDispositivo={options.deviceName || '🌐 SERVIDOR PROXY'}
      corDispositivo={meta.corDestaque}
    />
  );
};
