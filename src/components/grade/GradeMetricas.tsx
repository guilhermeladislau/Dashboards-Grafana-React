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

/**
 * Converte o valor digitado em "Quantidade de Dispositivos / Métricas Monitoradas".
 * Vazio, 0, negativo ou texto inválido = sem limite.
 */
export function interpretarLimiteExibicao(valor: unknown): number {
  if (valor === undefined || valor === null) {
    return 0;
  }
  const numero = Math.floor(Number(String(valor).trim()));
  return Number.isFinite(numero) && numero > 0 ? numero : 0;
}

/**
 * Aplica o limite: quando há vários dispositivos, limita a quantidade de DISPOSITIVOS
 * (mantendo todas as métricas de cada um); com um único dispositivo, limita as MÉTRICAS.
 */
function aplicarLimite(items: MetricBlockItem[], limite: number): MetricBlockItem[] {
  if (limite <= 0) {
    return items;
  }
  const dispositivos = Array.from(
    new Set(items.map((i) => i.deviceName).filter((n): n is string => Boolean(n)))
  );
  if (dispositivos.length > 1) {
    const permitidos = new Set(dispositivos.slice(0, limite));
    return items.filter((i) => !i.deviceName || permitidos.has(i.deviceName));
  }
  return items.slice(0, limite);
}

/**
 * Agrupa os itens de métricas pelo dispositivo ao qual pertencem.
 */
function agruparItensPorDispositivo(
  itens: MetricBlockItem[],
  nomeDispositivoPainel?: string
): Map<string, MetricBlockItem[]> {
  const grupos = new Map<string, MetricBlockItem[]>();
  for (const item of itens) {
    const chave = item.deviceName || nomeDispositivoPainel || 'Dispositivo Principal';
    if (!grupos.has(chave)) {
      grupos.set(chave, []);
    }
    grupos.get(chave)!.push(item);
  }
  return grupos;
}

export const GradeMetricas: React.FC<GradeMetricasProps> = ({ items, options }) => {
  // Limita a quantidade de dispositivos/métricas exibidas se configurado
  const itensExibidos = aplicarLimite(items, interpretarLimiteExibicao(options.maxDevices));

  const estiloGrade = obterEstilosGrade(options);

  // Modo explícito: cada métrica isolada em seu próprio card na grade
  if (options.cardDisplayMode === 'metricas_separadas') {
    return (
      <div className={estiloGrade}>
        {itensExibidos.map((item) => (
          <SeletorBlocoDispositivo key={item.id} item={item} options={options} />
        ))}
      </div>
    );
  }

  const dispositivosCadastradosAtivos = (
    options.monitoredDevicesConfig?.devices || []
  ).filter((d) => d.enabled !== false && d.name && d.name.trim() !== '');

  const agruparPorDispositivosConfig =
    dispositivosCadastradosAtivos.length > 0 &&
    options.monitoredDevicesConfig?.groupInSingleCard !== false;

  const gruposPorDispositivo = agruparItensPorDispositivo(itensExibidos, options.deviceName);

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
    if (modoAgrupamento === 'por_dispositivo' && gruposPorDispositivo.size > 1) {
      return (
        <div
          className={css`
            display: flex;
            flex-direction: column;
            gap: 16px;
            width: 100%;
          `}
        >
          {Array.from(gruposPorDispositivo.entries()).map(([nomeDisp, listaGrupo]) => (
            <BlocoConsolidadoDispositivo
              key={nomeDisp}
              items={listaGrupo}
              options={{ ...options, deviceName: nomeDisp }}
              tituloCabecalhoCustomizado={nomeDisp}
            />
          ))}
        </div>
      );
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

  // Modo padrão ('individual' = 1 Card por Dispositivo):
  // - Se houver apenas 1 dispositivo e ele possuir múltiplas métricas (ex: Dispositivo "CPU" com
  //   "Uso de CPU" e "Número de núcleos"), renderiza 1 único Card do Dispositivo contendo todas as suas métricas.
  // - Se houver apenas 1 dispositivo com 1 única métrica, renderiza o bloco compacto do dispositivo.
  if (gruposPorDispositivo.size === 1) {
    if (itensExibidos.length === 1) {
      return (
        <div className={estiloGrade}>
          <SeletorBlocoDispositivo item={itensExibidos[0]} options={options} />
        </div>
      );
    }
    return (
      <BlocoConsolidadoDispositivo
        items={itensExibidos}
        options={options}
        totalOriginal={items.length}
      />
    );
  }

  // Múltiplos dispositivos em modo '1 Card por Dispositivo':
  // Se cada dispositivo tiver apenas 1 métrica, exibe os blocos compactos na grade;
  // se algum dispositivo tiver múltiplas métricas, renderiza 1 Card consolidado por Dispositivo.
  const algumDispositivoTemVariasMetricas = Array.from(gruposPorDispositivo.values()).some(
    (lista) => lista.length > 1
  );

  if (algumDispositivoTemVariasMetricas) {
    return (
      <div
        className={css`
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        `}
      >
        {Array.from(gruposPorDispositivo.entries()).map(([nomeDisp, listaGrupo]) => (
          <BlocoConsolidadoDispositivo
            key={nomeDisp}
            items={listaGrupo}
            options={{ ...options, deviceName: nomeDisp }}
            tituloCabecalhoCustomizado={nomeDisp}
          />
        ))}
      </div>
    );
  }

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
