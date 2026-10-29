import React from 'react';
import { css } from '@emotion/css';
import { useStyles2, useTheme2 } from '@grafana/ui';
import { MetricBlockItem, PanelOptions } from '../../types';
import { obterEstilosBloco } from './BlocoMetrica.styles';
import { CabecalhoBloco } from './CabecalhoBloco';
import { ValorMetrica } from './ValorMetrica';
import { RodapeBloco } from './RodapeBloco';
import { RenderizadorGrafico } from '../graficos/RenderizadorGrafico';

export interface BlocoMetricaProps {
  item: MetricBlockItem;
  options: PanelOptions;
  etiquetaDispositivo?: string;
  corDispositivo?: string;
}

export const BlocoMetrica: React.FC<BlocoMetricaProps> = ({
  item,
  options,
  etiquetaDispositivo,
  corDispositivo,
}) => {
  const tema = useTheme2();
  const estilos = useStyles2((t) => obterEstilosBloco(t, options, item));
  const ehCompactoLateral =
    item.chartType === 'circulo' ||
    item.chartType === 'arco' ||
    item.chartType === 'anel' ||
    item.chartType === 'termometro';

  const etiquetaResolvida = item.deviceName || etiquetaDispositivo;

  return (
    <div
      className={estilos.bloco}
      style={
        corDispositivo && !options.borderColor
          ? { borderTop: `3px solid ${corDispositivo}` }
          : undefined
      }
    >
      {/* Etiqueta sutil do tipo/nome do dispositivo (quando aplicável) */}
      {etiquetaResolvida && (
        <div
          className={css`
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: ${corDispositivo || tema.colors.text.secondary};
            margin-bottom: 4px;
            opacity: 0.85;
          `}
        >
          {etiquetaResolvida}
        </div>
      )}

      {/* Cabeçalho do Bloco */}
      <CabecalhoBloco
        titulo={item.title}
        categoria={item.category}
        icone={item.icon}
        tagStatus={item.statusBadge}
        corStatus={item.statusColor}
        exibirTagStatus={(item.showStatusBadge ?? options.showStatusBadge) !== false}
        tamanhoFonteTitulo={estilos.tamanhoAtual.titulo}
        corTexto={options.textColor}
        corTextoSecundario={tema.colors.text.secondary}
      />

      {/* Corpo com Valor Principal e Gráfico (lado a lado se for circular/arco/anel/termômetro, ou empilhado nos demais) */}
      {ehCompactoLateral ? (
        <div
          className={css`
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin: 2px 0 6px 0;
          `}
        >
          <ValorMetrica
            valor={item.displayValue}
            tamanhoFonte={estilos.tamanhoAtual.valor}
            nivelStatus={item.statusLevel}
            corStatus={item.statusColor}
            corTexto={options.textColor}
            corPadraoTema={tema.isDark ? '#ffffff' : '#0f172a'}
          />
          <RenderizadorGrafico
            item={item}
            opcoes={options}
            corPadraoTema={tema.colors.primary.main}
          />
        </div>
      ) : (
        <>
          <ValorMetrica
            valor={item.displayValue}
            tamanhoFonte={estilos.tamanhoAtual.valor}
            nivelStatus={item.statusLevel}
            corStatus={item.statusColor}
            corTexto={options.textColor}
            corPadraoTema={tema.isDark ? '#ffffff' : '#0f172a'}
          />
          <RenderizadorGrafico
            item={item}
            opcoes={options}
            corPadraoTema={tema.colors.primary.main}
          />
        </>
      )}

      {/* Rodapé informativo */}
      <RodapeBloco
        subTexto={item.subText}
        corStatus={item.statusColor}
        corReserva={tema.colors.text.secondary}
      />
    </div>
  );
};

// Aliases para compatibilidade
export const MetricCard = BlocoMetrica;
export type MetricCardProps = BlocoMetricaProps;
