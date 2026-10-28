import React from 'react';
import { MetricBlockItem, PanelOptions } from '../../types';
import { BlocoMetrica } from '../bloco/BlocoMetrica';
import { BlocoFirewall } from './BlocoFirewall';
import { BlocoVM } from './BlocoVM';
import { BlocoProxy } from './BlocoProxy';
import { BlocoHost } from './BlocoHost';
import { BlocoServidor } from './BlocoServidor';
import { BlocoAccessPoint } from './BlocoAccessPoint';
import { BlocoPortaRede } from './BlocoPortaRede';

export interface SeletorBlocoDispositivoProps {
  item: MetricBlockItem;
  options: PanelOptions;
}

export const SeletorBlocoDispositivo: React.FC<SeletorBlocoDispositivoProps> = ({
  item,
  options,
}) => {
  switch (item.deviceType) {
    case 'firewall':
      return <BlocoFirewall item={item} options={options} />;
    case 'vm':
      return <BlocoVM item={item} options={options} />;
    case 'proxy':
      return <BlocoProxy item={item} options={options} />;
    case 'host':
      return <BlocoHost item={item} options={options} />;
    case 'servidor':
      return <BlocoServidor item={item} options={options} />;
    case 'access_point':
      return <BlocoAccessPoint item={item} options={options} />;
    case 'porta_rede':
      return <BlocoPortaRede item={item} options={options} />;
    case 'auto':
    default:
      return <BlocoMetrica item={item} options={options} />;
  }
};
