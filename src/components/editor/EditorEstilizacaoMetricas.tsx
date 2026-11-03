import React from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Button, Checkbox, Field, Input, Select, Switch, useTheme2 } from '@grafana/ui';
import {
  AnyDeviceMetricType,
  ChartType,
  MetricStyleOverride,
  PanelOptions,
  StandardUnitType,
  ThresholdMode,
} from '../../types';
import {
  detectarMetricasDaQuery,
  obterDispositivoAtivo,
  obterMetricasDisponiveisParaDispositivo,
  PRECONFIGURACOES_METRICAS,
} from '../../utilitarios/preconfiguracoesDispositivos';
import { GavetaRetratil } from './GavetaRetratil';
import { ControleCorComReset } from './ControleCorComReset';
import { OPCOES_MODO_LIMIARES, OPCOES_VARIACOES_GRAFICOS } from './EditorEstilizacaoVisual';
import { OPCOES_UNIDADES } from './EditorStandardOptions';

function temOverrideAtivo(est?: MetricStyleOverride): boolean {
  if (!est) {
    return false;
  }
  return Boolean(
    (est.displayName && est.displayName.trim() !== '') ||
      (est.seriesFilter && est.seriesFilter.trim() !== '') ||
      (est.chartType && est.chartType !== 'auto') ||
      (est.unit && est.unit !== 'auto') ||
      est.decimalsAuto === false ||
      est.sparklineColor ||
      (est.thresholdMode && est.thresholdMode !== 'auto') ||
      est.thresholdWarning !== undefined ||
      est.thresholdCritical !== undefined ||
      est.colorOk ||
      est.colorWarning ||
      est.colorCritical ||
      est.fixedMetricColor ||
      est.prefix ||
      est.suffix ||
      est.min !== undefined ||
      est.max !== undefined ||
      est.showStatusBadge !== undefined ||
      (est.linkUrl && est.linkUrl.trim() !== '')
  );
}

export const EditorEstilizacaoMetricas: React.FC<
  StandardEditorProps<Record<string, MetricStyleOverride>, any, PanelOptions>
> = ({ value, onChange, context }) => {
  const tema = useTheme2();
  const opcoes = context?.options || ({} as Partial<PanelOptions>);
  const dispositivoAtivo = obterDispositivoAtivo(opcoes);
  const catalogoDispositivo = obterMetricasDisponiveisParaDispositivo(dispositivoAtivo);

  const selecionadas: AnyDeviceMetricType[] = Array.isArray(opcoes.selectedMetrics)
    ? opcoes.selectedMetrics.filter((m) => m !== 'auto_device')
    : [];

  // Se o usuário selecionou métricas específicas, exibe apenas elas para estilizar;
  // caso contrário (modo Automático), exibe somente as métricas DETECTADAS na query.
  const modoAutomatico = selecionadas.length === 0;
  const metricasParaEstilizar: Array<{ value: string; label: string; icone: string }> =
    modoAutomatico
      ? detectarMetricasDaQuery(context?.data, dispositivoAtivo).map((m) => ({
          value: m.chave,
          label: m.rotulo,
          icone: m.icone,
        }))
      : catalogoDispositivo
          .filter((m) => selecionadas.includes(m.value))
          .map((m) => ({ value: m.value as string, label: m.label, icone: m.icone }));

  const mapaEstilos: Record<string, MetricStyleOverride> = value || {};

  const atualizarMetrica = (chave: string, parcial: Partial<MetricStyleOverride>) => {
    const atual = mapaEstilos[chave] || { metricKey: chave };
    onChange({
      ...mapaEstilos,
      [chave]: {
        ...atual,
        ...parcial,
        metricKey: chave,
      },
    });
  };

  const resetarMetrica = (chave: string) => {
    // No Grafana (Scenes/VizPanel), onOptionsChange faz mergeWith do objeto;
    // deletar a chave (delete obj[chave]) mantém o valor antigo no estado do painel.
    // Para limpar uma chave de objeto no Grafana, é obrigatório atribuir undefined explicitamente.
    const copia: Record<string, any> = { ...mapaEstilos };
    copia[chave] = undefined;
    onChange(copia);
  };

  const resetarTodasMetricas = () => {
    const copia: Record<string, any> = {};
    Object.keys(mapaEstilos).forEach((k) => {
      copia[k] = undefined;
    });
    metricasParaEstilizar.forEach((m) => {
      copia[m.value] = undefined;
    });
    onChange(copia);
  };

  const totalCustomizadas = metricasParaEstilizar.filter((m) =>
    temOverrideAtivo(mapaEstilos[m.value])
  ).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: tema.colors.text.primary,
          }}
        >
          🎨 Estilização Individual por Métrica
        </span>
        {totalCustomizadas > 0 && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            fill="text"
            icon="history"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              resetarTodasMetricas();
            }}
          >
            Resetar todas ({totalCustomizadas})
          </Button>
        )}
      </div>

      <div
        style={{
          fontSize: 11,
          color: tema.colors.text.secondary,
          marginBottom: 4,
          lineHeight: 1.35,
        }}
      >
        {metricasParaEstilizar.length === 0
          ? modoAutomatico
            ? 'Nenhuma métrica detectada na query ainda. Configure a query (ou selecione métricas em "Quais Métricas Monitorar") para estilizá-las individualmente.'
            : 'Nenhuma métrica selecionada.'
          : modoAutomatico
          ? `Modo automático: ${metricasParaEstilizar.length} métrica(s) detectada(s) na query. Clique em uma para personalizar gráfico, cores, limiares, unidade e título:`
          : 'Clique em uma métrica abaixo para personalizar seu gráfico, cores, limiares, unidade e título individualmente:'}
      </div>

      {metricasParaEstilizar.map((m) => {
        const chave = m.value;
        const preconfig = PRECONFIGURACOES_METRICAS[chave];
        const est = mapaEstilos[chave] || { metricKey: chave };
        const customizado = temOverrideAtivo(est);

        const chartType: ChartType = est.chartType ?? 'auto';
        const unit: StandardUnitType = est.unit ?? 'auto';
        const decimalsAuto: boolean = est.decimalsAuto !== false;
        const customDecimals: number = est.customDecimals ?? preconfig?.decimais ?? 1;
        const thresholdMode: ThresholdMode = est.thresholdMode ?? 'auto';
        const thresholdWarning: number = est.thresholdWarning ?? preconfig?.limiarAtencao ?? 70;
        const thresholdCritical: number = est.thresholdCritical ?? preconfig?.limiarCritico ?? 85;
        const min: number = est.min ?? preconfig?.minimo ?? 0;
        const max: number = est.max ?? preconfig?.maximo ?? 100;
        const showStatusBadge: boolean = est.showStatusBadge !== false;

        return (
          <GavetaRetratil
            key={chave}
            titulo={`${m.icone} ${est.displayName || m.label}${customizado ? ' • ✨ Customizado' : ''}`}
            subtitulo={
              preconfig
                ? `Padrão: Gráfico ${preconfig.graficoPadrao} | Limiares ${preconfig.limiarAtencao}/${preconfig.limiarCritico}`
                : 'Métrica detectada na query (sem pré-configuração)'
            }
            abertaInicial={false}
          >
            {/* 1. Nome de Exibição e Filtro de Série */}
            <Field
              label="Nome de Exibição Customizado"
              description="Sobrescreve o título exibido apenas para esta métrica"
            >
              <Input
                value={est.displayName || ''}
                placeholder={preconfig?.rotulo || m.label}
                onChange={(e) => atualizarMetrica(chave, { displayName: e.currentTarget.value })}
              />
            </Field>

            <Field
              label="Filtro de Série / Item Zabbix (Opcional)"
              description="Texto ou RefId (ex: CPU, Memory, A, B) para vincular uma série específica da query a esta métrica"
            >
              <Input
                value={est.seriesFilter || ''}
                placeholder="Automático por palavra-chave"
                onChange={(e) => atualizarMetrica(chave, { seriesFilter: e.currentTarget.value })}
              />
            </Field>

            <Field
              label="🔗 Link de Redirecionamento (URL)"
              description="Torna o quadradinho desta métrica clicável (ex: /d/... ou https://... com ${host})"
            >
              <Input
                value={est.linkUrl || ''}
                placeholder="Ex: https://zabbix... ou /d/... com ${host}"
                onChange={(e) => atualizarMetrica(chave, { linkUrl: e.currentTarget.value })}
              />
            </Field>

            <Field label="Abrir Link em Nova Aba">
              <Switch
                value={est.linkTargetBlank !== false}
                onChange={(e) =>
                  atualizarMetrica(chave, { linkTargetBlank: e.currentTarget.checked })
                }
              />
            </Field>

            {/* 2. Variação do Gráfico */}
            <Field
              label="Tipo de Gráfico desta Métrica"
              description={`Padrão desta métrica: ${preconfig?.graficoPadrao || 'barra'}`}
            >
              <Select
                options={OPCOES_VARIACOES_GRAFICOS}
                value={chartType}
                onChange={(opt) =>
                  atualizarMetrica(chave, { chartType: (opt.value as ChartType) || 'auto' })
                }
              />
            </Field>

            {/* 3. Cor Customizada do Gráfico */}
            <ControleCorComReset
              label="Cor do Gráfico desta Métrica"
              description="Define uma cor exclusiva para o gráfico desta métrica"
              valor={est.sparklineColor || ''}
              corPadrao="#6366f1"
              rotuloPadrao="Dinâmica por Status (Padrão)"
              onChange={(novaCor) => atualizarMetrica(chave, { sparklineColor: novaCor })}
              onReset={() => atualizarMetrica(chave, { sparklineColor: '' })}
            />

            {/* 4. Unidade e Decimais */}
            <Field
              label="Unidade de Medida (Unit)"
              description={`Padrão desta métrica: ${preconfig?.unidadePadrao || 'auto'}`}
            >
              <Select
                options={OPCOES_UNIDADES}
                value={unit}
                onChange={(opt) =>
                  atualizarMetrica(chave, { unit: (opt.value as StandardUnitType) || 'auto' })
                }
              />
            </Field>

            <Field label="Casas Decimais">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Checkbox
                  label="Auto"
                  value={decimalsAuto}
                  onChange={(e) =>
                    atualizarMetrica(chave, { decimalsAuto: e.currentTarget.checked })
                  }
                />
                <div style={{ flex: 1 }}>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    disabled={decimalsAuto}
                    placeholder={decimalsAuto ? 'Automático' : '0 = Ilimitado'}
                    value={decimalsAuto ? '' : customDecimals === 0 ? '' : customDecimals}
                    onChange={(e) => {
                      const val = e.currentTarget.value;
                      atualizarMetrica(chave, {
                        customDecimals: val === '' ? 0 : Number(val),
                      });
                    }}
                  />
                </div>
              </div>
            </Field>

            {/* 5. Prefixo, Sufixo e Escala Min/Max */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Field label="Prefixo">
                <Input
                  value={est.prefix || ''}
                  placeholder="Ex: ~"
                  onChange={(e) => atualizarMetrica(chave, { prefix: e.currentTarget.value })}
                />
              </Field>
              <Field label="Sufixo">
                <Input
                  value={est.suffix || ''}
                  placeholder="Ex: /s"
                  onChange={(e) => atualizarMetrica(chave, { suffix: e.currentTarget.value })}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Field label="Escala Mín (Min)">
                <Input
                  type="number"
                  value={min}
                  onChange={(e) =>
                    atualizarMetrica(chave, { min: Number(e.currentTarget.value) })
                  }
                />
              </Field>
              <Field label="Escala Máx (Max)">
                <Input
                  type="number"
                  value={max}
                  onChange={(e) =>
                    atualizarMetrica(chave, { max: Number(e.currentTarget.value) })
                  }
                />
              </Field>
            </div>

            {/* 6. Limiares e Cores de Estado */}
            <Field label="Esquema de Limiares desta Métrica">
              <Select
                options={OPCOES_MODO_LIMIARES}
                value={thresholdMode}
                onChange={(opt) =>
                  atualizarMetrica(chave, {
                    thresholdMode: (opt.value as ThresholdMode) || 'auto',
                  })
                }
              />
            </Field>

            {thresholdMode !== 'fixo' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <Field label="Limiar Atenção (Warning)">
                    <Input
                      type="number"
                      value={thresholdWarning}
                      onChange={(e) =>
                        atualizarMetrica(chave, {
                          thresholdWarning: Number(e.currentTarget.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Limiar Crítico (Critical)">
                    <Input
                      type="number"
                      value={thresholdCritical}
                      onChange={(e) =>
                        atualizarMetrica(chave, {
                          thresholdCritical: Number(e.currentTarget.value),
                        })
                      }
                    />
                  </Field>
                </div>

                <ControleCorComReset
                  label="Cor Normal (OK)"
                  valor={est.colorOk || ''}
                  corPadrao="#22c55e"
                  rotuloPadrao="Verde (#22c55e)"
                  onChange={(cor) => atualizarMetrica(chave, { colorOk: cor })}
                  onReset={() => atualizarMetrica(chave, { colorOk: '' })}
                />
                <ControleCorComReset
                  label="Cor Atenção (Warning)"
                  valor={est.colorWarning || ''}
                  corPadrao="#f59e0b"
                  rotuloPadrao="Amarelo (#f59e0b)"
                  onChange={(cor) => atualizarMetrica(chave, { colorWarning: cor })}
                  onReset={() => atualizarMetrica(chave, { colorWarning: '' })}
                />
                <ControleCorComReset
                  label="Cor Crítico (Critical)"
                  valor={est.colorCritical || ''}
                  corPadrao="#ef4444"
                  rotuloPadrao="Vermelho (#ef4444)"
                  onChange={(cor) => atualizarMetrica(chave, { colorCritical: cor })}
                  onReset={() => atualizarMetrica(chave, { colorCritical: '' })}
                />
              </>
            )}

            {thresholdMode === 'fixo' && (
              <ControleCorComReset
                label="Cor Fixa desta Métrica"
                valor={est.fixedMetricColor || ''}
                corPadrao="#3b82f6"
                rotuloPadrao="Azul (#3b82f6)"
                onChange={(cor) => atualizarMetrica(chave, { fixedMetricColor: cor })}
                onReset={() => atualizarMetrica(chave, { fixedMetricColor: '' })}
              />
            )}

            <Field label="Exibir Tag de Status nesta métrica">
              <Switch
                value={showStatusBadge}
                onChange={(e) =>
                  atualizarMetrica(chave, { showStatusBadge: e.currentTarget.checked })
                }
              />
            </Field>

            {customizado && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                fill="outline"
                icon="history"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  resetarMetrica(chave);
                }}
              >
                Restaurar padrão desta métrica
              </Button>
            )}
          </GavetaRetratil>
        );
      })}
    </div>
  );
};
