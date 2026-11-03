import React from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Button, Checkbox, useTheme2 } from '@grafana/ui';
import { AnyDeviceMetricType, PanelOptions } from '../../types';
import {
  detectarMetricasDaQuery,
  METADADOS_DISPOSITIVOS,
  obterDispositivoAtivo,
  obterMetricasDisponiveisParaDispositivo,
  PRECONFIGURACOES_METRICAS,
} from '../../utilitarios/preconfiguracoesDispositivos';

export const EditorSelecaoMetricas: React.FC<
  StandardEditorProps<AnyDeviceMetricType[], any, PanelOptions>
> = ({ value, onChange, context }) => {
  const tema = useTheme2();
  const opcoes = context?.options || ({} as Partial<PanelOptions>);
  const dispositivoAtivo = obterDispositivoAtivo(opcoes);
  const metaDispositivo = METADADOS_DISPOSITIVOS[dispositivoAtivo];
  const metricasDisponiveis = obterMetricasDisponiveisParaDispositivo(dispositivoAtivo);
  const chavesDetectadasNaQuery = new Set(
    detectarMetricasDaQuery(context?.data, dispositivoAtivo).map((m) => m.chave)
  );

  const selecionadas: AnyDeviceMetricType[] = Array.isArray(value)
    ? value.filter((m) => m !== 'auto_device')
    : [];

  const alternarMetrica = (chave: AnyDeviceMetricType) => {
    if (selecionadas.includes(chave)) {
      onChange(selecionadas.filter((m) => m !== chave));
    } else {
      onChange([...selecionadas, chave]);
    }
  };

  const selecionarTodas = () => {
    onChange(metricasDisponiveis.map((m) => m.value));
  };

  const selecionarEssenciais = () => {
    const essenciais = metricasDisponiveis
      .filter((m) => m.essencial)
      .map((m) => m.value);
    onChange(essenciais.length > 0 ? essenciais : metricasDisponiveis.slice(0, 4).map((m) => m.value));
  };

  const deselecionarTudo = () => {
    onChange([]);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 8,
        background: tema.colors.background.secondary,
        border: `1px solid ${tema.colors.border.weak}`,
        marginBottom: 8,
      }}
    >
      {/* Cabeçalho e resumo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 15 }}>{metaDispositivo.icone}</span>
          <span
            style={{
              fontWeight: 700,
              fontSize: 12,
              color: tema.colors.text.primary,
            }}
          >
            Métricas de {metaDispositivo.nome}
          </span>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 12,
            background:
              selecionadas.length > 0
                ? `${metaDispositivo.corDestaque}22`
                : tema.colors.background.canvas,
            color:
              selecionadas.length > 0
                ? metaDispositivo.corDestaque
                : tema.colors.text.secondary,
            border: `1px solid ${
              selecionadas.length > 0
                ? `${metaDispositivo.corDestaque}55`
                : tema.colors.border.weak
            }`,
          }}
        >
          {selecionadas.length > 0
            ? `${selecionadas.length} selecionada(s)`
            : '✨ Automático (Todas da Query)'}
        </span>
      </div>

      {/* Botões de ação rápida */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <Button
          size="sm"
          variant="secondary"
          fill="outline"
          onClick={selecionarEssenciais}
          title="Seleciona as principais métricas recomendadas para este dispositivo"
        >
          ⭐ Essenciais
        </Button>
        <Button
          size="sm"
          variant="secondary"
          fill="outline"
          onClick={selecionarTodas}
          title="Marca todas as métricas disponíveis para este dispositivo"
        >
          ✅ Todas ({metricasDisponiveis.length})
        </Button>
        <Button
          size="sm"
          variant="destructive"
          fill="outline"
          onClick={deselecionarTudo}
          disabled={selecionadas.length === 0}
          title="Desmarca todas as métricas (volta ao modo automático: exibe as métricas detectadas na query)"
        >
          ❌ Deselecionar tudo
        </Button>
      </div>

      {/* Lista de checkboxes das métricas */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          maxHeight: 280,
          overflowY: 'auto',
          paddingRight: 2,
        }}
      >
        {metricasDisponiveis.map((item) => {
          const ativa = selecionadas.includes(item.value);
          const preconfig = PRECONFIGURACOES_METRICAS[item.value];
          return (
            <div
              key={item.value}
              role="button"
              tabIndex={0}
              onClick={() => alternarMetrica(item.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  alternarMetrica(item.value);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: 6,
                cursor: 'pointer',
                background: ativa
                  ? `${metaDispositivo.corDestaque}18`
                  : tema.colors.background.primary,
                border: `1px solid ${
                  ativa ? metaDispositivo.corDestaque : tema.colors.border.weak
                }`,
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  value={ativa}
                  onChange={() => alternarMetrica(item.value)}
                />
                <span style={{ fontSize: 14 }}>{item.icone}</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: ativa ? 600 : 400,
                    color: ativa
                      ? tema.colors.text.maxContrast
                      : tema.colors.text.primary,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.label}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              {chavesDetectadasNaQuery.has(item.value) && (
                <span
                  title="Métrica encontrada nas séries retornadas pela query"
                  style={{
                    fontSize: 10,
                    color: tema.colors.success.text,
                    border: `1px solid ${tema.colors.success.border}`,
                    padding: '0 5px',
                    borderRadius: 4,
                  }}
                >
                  na query
                </span>
              )}
              {preconfig && (
                <span
                  style={{
                    fontSize: 10,
                    color: tema.colors.text.secondary,
                    background: tema.colors.background.secondary,
                    padding: '1px 6px',
                    borderRadius: 4,
                    marginLeft: 6,
                    flexShrink: 0,
                  }}
                >
                  {preconfig.graficoPadrao}
                </span>
              )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          fontSize: 11,
          color: tema.colors.text.secondary,
          lineHeight: 1.35,
        }}
      >
        {selecionadas.length === 0
          ? '💡 Nenhuma métrica filtrada manualmente: todas as métricas retornadas pela query do Zabbix serão exibidas. Marque acima para escolher quais métricas monitorar.'
          : '💡 As métricas marcadas acima serão monitoradas no card e podem ser estilizadas individualmente logo abaixo.'}
      </div>
    </div>
  );
};
