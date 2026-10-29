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
  tituloCabecalhoCustomizado?: string;
  subtituloCabecalhoCustomizado?: string;
  iconeCabecalhoCustomizado?: string;
}

export const BlocoConsolidadoDispositivo: React.FC<BlocoConsolidadoDispositivoProps> = ({
  items,
  options,
  totalOriginal,
  tituloCabecalhoCustomizado,
  subtituloCabecalhoCustomizado,
  iconeCabecalhoCustomizado,
}) => {
  const tema = useTheme2();
  const dispositivo = obterDispositivoAtivo(options);
  const meta = METADADOS_DISPOSITIVOS[dispositivo];
  const padroes = obterCoresPadraoBloco(tema);
  const dimensoes = obterDimensoesBloco(options.blockSize, options.blockHeight);
  const tamanhoAtual = obterTamanhoResolvido(options.fontSize);
  const familiaFonte = obterFamiliaFonteResolvida(options.fontFamily);

  // Analisa quantos dispositivos e métricas diferentes existem neste card
  const nomesDispositivosUnicos = Array.from(
    new Set(items.map((i) => i.deviceName).filter(Boolean))
  );
  const metricasUnicas = Array.from(
    new Set(items.map((i) => i.metricName || i.title).filter(Boolean))
  );

  const temMultiplosDispositivos =
    nomesDispositivosUnicos.length > 1 ||
    (nomesDispositivosUnicos.length === 1 &&
      items.length > 1 &&
      metricasUnicas.length === 1);

  const ehMesmaMetricaMultiplosDispositivos =
    temMultiplosDispositivos && metricasUnicas.length === 1;

  // Contagem de status para o cabeçalho
  const qtdCritico = items.filter(
    (i) => i.statusLevel === 'critical' || i.statusLevel === 'offline'
  ).length;
  const qtdAtencao = items.filter((i) => i.statusLevel === 'warning').length;
  const qtdOk = items.length - qtdCritico - qtdAtencao;

  const statusGeral =
    qtdCritico > 0
      ? { tag: 'CRÍTICO', cor: '#ef4444' }
      : qtdAtencao > 0
      ? { tag: 'ATENÇÃO', cor: '#f59e0b' }
      : { tag: 'OPERACIONAL', cor: '#22c55e' };

  const tituloPrincipalCard =
    tituloCabecalhoCustomizado ||
    (ehMesmaMetricaMultiplosDispositivos
      ? `${options.deviceName || meta.nome} — ${metricasUnicas[0]}`
      : options.deviceName ||
        (nomesDispositivosUnicos.length === 1
          ? nomesDispositivosUnicos[0]
          : meta.nome));

  const subtituloPrincipalCard =
    subtituloCabecalhoCustomizado ||
    (temMultiplosDispositivos
      ? `${nomesDispositivosUnicos.length || items.length} dispositivo(s) monitorado(s) • ${qtdOk} normal${
          qtdAtencao > 0 ? ` • ${qtdAtencao} atenção` : ''
        }${qtdCritico > 0 ? ` • ${qtdCritico} crítico` : ''}`
      : totalOriginal && totalOriginal > items.length
      ? `Exibindo ${items.length} de ${totalOriginal} métricas monitoradas`
      : `${items.length} métrica(s) monitorada(s) no dispositivo`);

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
      {/* Cabeçalho do Card Consolidado */}
      <div
        className={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          margin-bottom: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          gap: 12px;
        `}
      >
        <div
          className={css`
            display: flex;
            align-items: center;
            gap: 10px;
            overflow: hidden;
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
              flex-shrink: 0;
            `}
          >
            {iconeCabecalhoCustomizado || meta.icone}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div
              className={css`
                font-size: 14px;
                font-weight: 800;
                letter-spacing: 0.3px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              `}
            >
              {tituloPrincipalCard}
            </div>
            <div
              className={css`
                font-size: 10px;
                color: ${tema.colors.text.secondary};
              `}
            >
              {subtituloPrincipalCard}
            </div>
          </div>
        </div>

        {options.showStatusBadge !== false && (
          <TagStatus tag={statusGeral.tag} corStatus={statusGeral.cor} />
        )}
      </div>

      {/* Sub-grade interna com os dispositivos / métricas monitoradas */}
      <div
        className={css`
          display: grid;
          grid-template-columns: ${obterColunasGrade(
            options.columns,
            dimensoes.larguraMinimaGrade
          )};
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

          const exibirBadgeItem =
            (item.showStatusBadge ?? options.showStatusBadge) !== false;

          // Quando estamos exibindo vários dispositivos para a mesma métrica (ex: Uso de CPU de 10 servidores),
          // o destaque principal do sub-card é o nome do Servidor/Dispositivo
          const tituloPrincipalCelula =
            ehMesmaMetricaMultiplosDispositivos && item.deviceName
              ? item.deviceName
              : item.title;

          const exibirEtiquetaDispositivoTopo =
            !ehMesmaMetricaMultiplosDispositivos &&
            temMultiplosDispositivos &&
            Boolean(item.deviceName);

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
                transition: border-color 0.2s ease, transform 0.15s ease;

                &:hover {
                  border-color: ${item.statusColor || meta.corDestaque};
                }
              `}
            >
              <div>
                {/* Etiqueta do dispositivo no topo quando há múltiplos dispositivos E múltiplas métricas */}
                {exibirEtiquetaDispositivoTopo && (
                  <div
                    className={css`
                      font-size: 9px;
                      font-weight: 800;
                      text-transform: uppercase;
                      letter-spacing: 0.5px;
                      color: ${meta.corDestaque};
                      margin-bottom: 4px;
                      display: flex;
                      align-items: center;
                      gap: 4px;
                    `}
                  >
                    <span>{meta.icone}</span>
                    <span
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.deviceName}
                    </span>
                  </div>
                )}

                <div
                  className={css`
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 6px;
                    margin-bottom: 4px;
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
                      icone={
                        ehMesmaMetricaMultiplosDispositivos
                          ? meta.icone
                          : item.icon
                      }
                      titulo={tituloPrincipalCelula}
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
                        color: ${ehMesmaMetricaMultiplosDispositivos
                          ? options.textColor || padroes.textoPadrao
                          : tema.colors.text.secondary};
                      `}
                      title={tituloPrincipalCelula}
                    >
                      {tituloPrincipalCelula}
                    </span>
                  </div>
                  {exibirBadgeItem && item.statusBadge && (
                    <TagStatus
                      tag={item.statusBadge}
                      corStatus={item.statusColor}
                    />
                  )}
                </div>

                {/* Subtítulo da métrica quando o título principal da célula é o nome do Servidor */}
                {ehMesmaMetricaMultiplosDispositivos && item.deviceName && (
                  <div
                    className={css`
                      font-size: 10px;
                      color: ${tema.colors.text.secondary};
                      margin-bottom: 4px;
                      display: flex;
                      align-items: center;
                      gap: 4px;
                    `}
                  >
                    {item.icon && <span>{item.icon}</span>}
                    <span
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.metricName || item.title}
                    </span>
                  </div>
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
