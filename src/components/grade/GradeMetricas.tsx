import React from 'react';
import { css } from '@emotion/css';
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

  const dispositivosCadastradosAtivos = (
    options.monitoredDevicesConfig?.devices || []
  ).filter((d) => d.enabled !== false && d.name && d.name.trim() !== '');

  const agruparPorDispositivosConfig =
    dispositivosCadastradosAtivos.length > 0 &&
    options.monitoredDevicesConfig?.groupInSingleCard !== false;

  const usarModoConsolidado =
    options.cardDisplayMode === 'consolidado' || agruparPorDispositivosConfig;

  if (usarModoConsolidado) {
    const modoAgrupamento =
      options.monitoredDevicesConfig?.consolidatedGroupMode || 'unico_card';

    // 1. Agrupado em 1 Card por Métrica (Ex: Card "Uso de CPU" com todos os 10 servidores)
    if (modoAgrupamento === 'por_metrica') {
      const gruposPorMetrica = new Map<string, MetricBlockItem[]>();
      for (const item of itensExibidos) {
        const chave = item.metricKey || item.metricName || item.title;
        if (!gruposPorMetrica.has(chave)) {
          gruposPorMetrica.set(chave, []);
        }
        gruposPorMetrica.get(chave)!.push(item);
      }

      if (gruposPorMetrica.size > 1) {
        return (
          <div
            className={css`
              display: flex;
              flex-direction: column;
              gap: 16px;
              width: 100%;
            `}
          >
            {Array.from(gruposPorMetrica.entries()).map(([chave, listaGrupo]) => {
              const primeiro = listaGrupo[0];
              return (
                <BlocoConsolidadoDispositivo
                  key={chave}
                  items={listaGrupo}
                  options={options}
                  tituloCabecalhoCustomizado={primeiro.metricName || primeiro.title}
                  iconeCabecalhoCustomizado={primeiro.icon}
                />
              );
            })}
          </div>
        );
      }
    }

    // 2. Agrupado em 1 Card por Dispositivo (Ex: 1 Card para cada Servidor com suas métricas)
    if (modoAgrupamento === 'por_dispositivo') {
      const gruposPorDispositivo = new Map<string, MetricBlockItem[]>();
      for (const item of itensExibidos) {
        const chave = item.deviceName || options.deviceName || 'Dispositivo Principal';
        if (!gruposPorDispositivo.has(chave)) {
          gruposPorDispositivo.set(chave, []);
        }
        gruposPorDispositivo.get(chave)!.push(item);
      }

      if (gruposPorDispositivo.size > 1) {
        return (
          <div
            className={css`
              display: flex;
              flex-direction: column;
              gap: 16px;
              width: 100%;
            `}
          >
            {Array.from(gruposPorDispositivo.entries()).map(
              ([nomeDisp, listaGrupo]) => (
                <BlocoConsolidadoDispositivo
                  key={nomeDisp}
                  items={listaGrupo}
                  options={{ ...options, deviceName: nomeDisp }}
                  tituloCabecalhoCustomizado={nomeDisp}
                />
              )
            )}
          </div>
        );
      }
    }

    // 3. Padrão ('unico_card'): Tudo dentro de um único Card Consolidado
    return (
      <BlocoConsolidadoDispositivo
        items={itensExibidos}
        options={options}
        totalOriginal={items.length}
      />
    );
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
