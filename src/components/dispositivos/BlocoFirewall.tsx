import React from 'react';
import { MetricBlockItem, PanelOptions } from '../../types';
import { BlocoMetrica } from '../bloco/BlocoMetrica';
import { METADADOS_DISPOSITIVOS } from '../../utilitarios/preconfiguracoesDispositivos';

export interface BlocoFirewallProps {
  item: MetricBlockItem;
  options: PanelOptions;
}

export const BlocoFirewall: React.FC<BlocoFirewallProps> = ({ item, options }) => {
  const meta = METADADOS_DISPOSITIVOS.firewall;

  return (
    <BlocoMetrica
      item={{
        ...item,
        icon: item.icon || meta.icone,
      }}
      options={options}
      etiquetaDispositivo={options.deviceName || '🛡️ FIREWALL'}
      corDispositivo={meta.corDestaque}
    />
  );
};
