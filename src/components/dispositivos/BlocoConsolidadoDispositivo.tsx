import React from 'react';
import { css } from '@emotion/css';
import { useTheme2 } from '@grafana/ui';
import { MetricBlockItem, PanelOptions } from '../../types';
import {
  METADADOS_DISPOSITIVOS,
  obterDispositivoAtivo,
} from '../../utilitarios/preconfiguracoesDispositivos';
import {
  obterCoresPadraoBloco,
  obterDimensoesBloco,
  obterFamiliaFonteResolvida,
  obterTamanhoResolvido,
} from '../../estilos';
import { TagStatus } from '../bloco/TagStatus';
import { IconeMetrica } from '../bloco/IconeMetrica';
import { RenderizadorGrafico } from '../graficos/RenderizadorGrafico';
import { obterColunasGrade } from '../grade/GradeMetricas.styles';

export interface BlocoConsolidadoDispositivoProps {
  items: MetricBlockItem[];
  options: PanelOptions;
  totalOriginal?: number;
}

export const BlocoConsolidadoDispositivo: React.FC<BlocoConsolidadoDispositivoProps> = ({
  items,
  options,
  totalOriginal,
}) => {
  const tema = useTheme2();
  const dispositivo = obterDispositivoAtivo(options);
  const meta = METADADOS_DISPOSITIVOS[dispositivo];
  const padroes = obterCoresPadraoBloco(tema);
  const dimensoes = obterDimensoesBloco(options.blockSize, options.blockHeight);
  const tamanhoAtual = obterTamanhoResolvido(options.fontSize);
  const familiaFonte = obterFamiliaFonteResolvida(options.fontFamily);

  // Determina o status geral do card consolidado a partir da métrica mais severa
  const temCritico = items.some(
    (i) => i.statusLevel === 'critical' || i.statusLevel === 'offline'
  );
  const temAtencao = items.some((i) => i.statusLevel === 'warning');

  const statusGeral = temCritico
    ? { tag: 'CRÍTICO', cor: '#ef4444' }
    : temAtencao
    ? { tag: 'ATENÇÃO', cor: '#f59e0b' }
    : { tag: 'OPERACIONAL', cor: '#22c55e' };

  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
        background: ${options.cardBackgroundColor || padroes.fundoPadrao};
        color: ${options.textColor || padroes.textoPadrao};
        border: 1px solid ${options.borderColor || padroes.bordaPadrao};
        border-top: 3px solid ${meta.corDestaque};
        border-radius: 16px;
        padding: 16px;
        font-family: ${familiaFonte};
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
        width: 100%;
      `}
    >
      {/* Cabeçalho do Dispositivo Consolidado */}
      <div
        className={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          margin-bottom: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        `}
      >
        <div
          className={css`
            display: flex;
            align-items: center;
            gap: 10px;
          `}
        >
          <div
            className={css`
              width: 34px;
              height: 34px;
              border-radius: 10px;
              background: ${meta.corDestaque}22;
              border: 1px solid ${meta.corDestaque}55;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
            `}
          >
            {meta.icone}
          </div>
          <div>
            <div
              className={css`
                font-size: 14px;
                font-weight: 800;
                letter-spacing: 0.3px;
              `}
            >
              {options.deviceName || meta.nome}
            </div>
            <div
              className={css`
                font-size: 10px;
                color: ${tema.colors.text.secondary};
              `}
            >
              {totalOriginal && totalOriginal > items.length
                ? `Exibindo ${items.length} de ${totalOriginal} métricas monitoradas`
                : `${items.length} métrica(s) monitorada(s) no dispositivo`}
            </div>
          </div>
        </div>

        {options.showStatusBadge !== false && (
          <TagStatus tag={statusGeral.tag} corStatus={statusGeral.cor} />
        )}
      </div>

      {/* Sub-grade interna com as métricas do dispositivo */}
      <div
        className={css`
          display: grid;
          grid-template-columns: ${obterColunasGrade(options.columns, dimensoes.larguraMinimaGrade)};
          gap: 12px;
          width: 100%;
        `}
      >
        {items.map((item) => {
          const ehCompactoLateral =
            item.chartType === 'circulo' ||
            item.chartType === 'arco' ||
            item.chartType === 'anel' ||
            item.chartType === 'termometro';
          return (
            <div
              key={item.id}
              className={css`
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: ${dimensoes.preenchimento};
                min-height: ${dimensoes.alturaMinima};
                transition: border-color 0.2s ease;

                &:hover {
                  border-color: ${item.statusColor || meta.corDestaque};
                }
              `}
            >
              <div
                className={css`
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 6px;
                  margin-bottom: 6px;
                `}
              >
                <div
                  className={css`
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    overflow: hidden;
                  `}
                >
                  <IconeMetrica
                    icone={item.icon}
                    titulo={item.title}
                    categoria={item.category}
                  />
                  <span
                    className={css`
                      font-size: ${tamanhoAtual.titulo};
                      font-weight: 700;
                      text-transform: uppercase;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      color: ${tema.colors.text.secondary};
                    `}
                    title={item.title}
                  >
                    {item.title}
                  </span>
                </div>
                {options.showStatusBadge !== false && item.statusBadge && (
                  <TagStatus tag={item.statusBadge} corStatus={item.statusColor} />
                )}
              </div>

              {ehCompactoLateral ? (
                <div
                  className={css`
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                  `}
                >
                  <span
                    className={css`
                      font-size: ${tamanhoAtual.valor};
                      font-weight: 800;
                      color: ${item.statusLevel === 'critical' ||
                      item.statusLevel === 'offline'
                        ? item.statusColor
                        : options.textColor || padroes.textoPadrao};
                    `}
                  >
                    {item.displayValue}
                  </span>
                  <RenderizadorGrafico
                    item={item}
                    opcoes={options}
                    corPadraoTema={meta.corDestaque}
                  />
                </div>
              ) : (
                <>
                  <span
                    className={css`
                      font-size: ${tamanhoAtual.valor};
                      font-weight: 800;
                      margin: 2px 0 6px 0;
                      color: ${item.statusLevel === 'critical' ||
                      item.statusLevel === 'offline'
                        ? item.statusColor
                        : options.textColor || padroes.textoPadrao};
                    `}
                  >
                    {item.displayValue}
                  </span>
                  <RenderizadorGrafico
                    item={item}
                    opcoes={options}
                    corPadraoTema={meta.corDestaque}
                  />
                </>
              )}

              {item.subText && (
                <div
                  className={css`
                    font-size: 9px;
                    color: ${item.statusColor || tema.colors.text.secondary};
                    font-weight: 600;
                    margin-top: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  `}
                >
                  {item.subText}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
