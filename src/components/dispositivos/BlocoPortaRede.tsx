import React from 'react';
import { MetricBlockItem, PanelOptions } from '../../types';
import { BlocoMetrica } from '../bloco/BlocoMetrica';
import { METADADOS_DISPOSITIVOS } from '../../utilitarios/preconfiguracoesDispositivos';

export interface BlocoPortaRedeProps {
  item: MetricBlockItem;
  options: PanelOptions;
}

export const BlocoPortaRede: React.FC<BlocoPortaRedeProps> = ({ item, options }) => {
  const meta = METADADOS_DISPOSITIVOS.porta_rede;

  return (
    <BlocoMetrica
      item={{
        ...item,
        icon: item.icon || meta.icone,
      }}
      options={options}
      etiquetaDispositivo={options.deviceName || '🔌 PORTA DE REDE / SWITCH'}
      corDispositivo={meta.corDestaque}
    />
  );
};
