import React from 'react';
import { MetricBlockItem, PanelOptions } from '../../types';
import { obterDimensoesBloco } from '../../estilos';
import { estaEmModoMultiplasMetricas } from '../../utilitarios/preconfiguracoesDispositivos';
import { GraficoBarra } from './GraficoBarra';
import { GraficoCirculo } from './GraficoCirculo';
import { GraficoArco } from './GraficoArco';
import { GraficoAnel } from './GraficoAnel';
import { GraficoTorre } from './GraficoTorre';
import { GraficoArea } from './GraficoArea';
import { GraficoLinha } from './GraficoLinha';
import { GraficoBullet } from './GraficoBullet';
import { GraficoTermometro } from './GraficoTermometro';

export interface RenderizadorGraficoProps {
  item: MetricBlockItem;
  opcoes: PanelOptions;
  corPadraoTema?: string;
}

export const RenderizadorGrafico: React.FC<RenderizadorGraficoProps> = ({
  item,
  opcoes,
  corPadraoTema = '#6366f1',
}) => {
  const tipo = item.chartType;
  const emMultiplasMetricas = estaEmModoMultiplasMetricas(opcoes);
  const corPrincipal = emMultiplasMetricas
    ? item.sparklineColor || item.statusColor || corPadraoTema
    : item.sparklineColor || opcoes.sparklineColor || item.statusColor || corPadraoTema;
  const dimensoes = obterDimensoesBloco(opcoes.blockSize, opcoes.blockHeight);

  if (tipo === 'nenhum') {
    return null;
  }

  if (tipo === 'barra') {
    if (opcoes.showProgressBar === false) {
      return null;
    }
    return (
      <GraficoBarra
        percentual={item.percentage ?? 50}
        nivelStatus={item.statusLevel}
        corStatus={
          emMultiplasMetricas
            ? item.sparklineColor || item.statusColor
            : item.sparklineColor || opcoes.sparklineColor || item.statusColor
        }
      />
    );
  }

  if (tipo === 'circulo') {
    return (
      <GraficoCirculo
        percentual={item.percentage ?? 50}
        corStatus={corPrincipal}
        tamanho={dimensoes.tamanhoCircular}
      />
    );
  }

  if (tipo === 'arco') {
    return (
      <GraficoArco
        percentual={item.percentage ?? 50}
        corStatus={corPrincipal}
        tamanho={dimensoes.tamanhoCircular + 8}
      />
    );
  }

  if (tipo === 'anel') {
    return (
      <GraficoAnel
        percentual={item.percentage ?? 50}
        corStatus={corPrincipal}
        tamanho={dimensoes.tamanhoCircular}
      />
    );
  }

  if (tipo === 'torre') {
    return (
      <GraficoTorre
        percentual={item.percentage ?? 50}
        pontos={item.points}
        corStatus={corPrincipal}
      />
    );
  }

  if (tipo === 'area') {
    if (opcoes.showSparkline === false) {
      return null;
    }
    return (
      <GraficoArea
        pontos={item.points}
        corLinha={corPrincipal}
        percentual={item.percentage ?? 50}
      />
    );
  }

  if (tipo === 'linha') {
    if (opcoes.showSparkline === false) {
      return null;
    }
    return (
      <GraficoLinha
        pontos={item.points}
        corLinha={corPrincipal}
        percentual={item.percentage ?? 50}
        altura={dimensoes.alturaGrafico}
      />
    );
  }

  if (tipo === 'bullet') {
    return (
      <GraficoBullet
        percentual={item.percentage ?? 50}
        corStatus={corPrincipal}
        limiarAtencao={item.thresholdWarning ?? opcoes.thresholdWarning ?? 70}
        limiarCritico={item.thresholdCritical ?? opcoes.thresholdCritical ?? 85}
      />
    );
  }

  if (tipo === 'termometro') {
    return (
      <GraficoTermometro
        percentual={item.percentage ?? 50}
        corStatus={corPrincipal}
        altura={dimensoes.tamanhoCircular}
      />
    );
  }

  return null;
};
