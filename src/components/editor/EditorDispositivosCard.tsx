import React, { useState } from 'react';
import { FieldType, getFieldDisplayName, SelectableValue, StandardEditorProps } from '@grafana/data';
import {
  Button,
  Checkbox,
  Field,
  Icon,
  IconButton,
  Input,
  Select,
  Switch,
  TextArea,
  useTheme2,
} from '@grafana/ui';
import {
  AnyDeviceMetricType,
  ChartType,
  ConsolidatedGroupMode,
  MonitoredDeviceItem,
  MonitoredDevicesConfigGroup,
  PanelOptions,
} from '../../types';
import {
  METADADOS_DISPOSITIVOS,
  obterDispositivoAtivo,
  obterMetricasDisponiveisParaDispositivo,
} from '../../utilitarios/preconfiguracoesDispositivos';
import { OPCOES_VARIACOES_GRAFICOS } from './EditorEstilizacaoVisual';
import { ControleCorComReset } from './ControleCorComReset';

const OPCOES_AGRUPAMENTO_CONSOLIDADO: Array<SelectableValue<ConsolidatedGroupMode>> = [
  {
    value: 'unico_card',
    label: '📦 Tudo em 1 Único Card (Todos os dispositivos juntos no card)',
  },
  {
    value: 'por_metrica',
    label: '📊 1 Card por Métrica (Ex: Card "Uso de CPU" com todos os servidores)',
  },
  {
    value: 'por_dispositivo',
    label: '🖥️ 1 Card por Dispositivo (Ex: 1 Card para cada Servidor com suas métricas)',
  },
];

function extrairNomesDispositivosDaQuery(context: StandardEditorProps['context']): string[] {
  const series = context?.data;
  if (!series || !Array.isArray(series) || series.length === 0) {
    return [];
  }

  const nomes = new Set<string>();
  for (const s of series) {
    const camposValor = s.fields?.filter(
      (f: any) => f.type === FieldType.number || f.type === FieldType.string
    );
    if (!camposValor || camposValor.length === 0) {
      if (s.name) {
        nomes.add(s.name.split(':')[0].trim());
      }
      continue;
    }

    for (const campo of camposValor) {
      const hostLabel =
        campo.labels?.host ||
        campo.labels?.hostname ||
        campo.labels?.device ||
        campo.labels?.instance ||
        campo.labels?.server;
      if (hostLabel) {
        nomes.add(String(hostLabel).trim());
        continue;
      }

      const bruto =
        campo.config?.displayName ||
        getFieldDisplayName(campo, s, series) ||
        s.name ||
        campo.name;
      if (bruto) {
        const str = String(bruto);
        if (str.includes(':')) {
          nomes.add(str.split(':')[0].trim());
        } else if (str.includes(' - ')) {
          nomes.add(str.split(' - ')[0].trim());
        } else {
          nomes.add(str.trim());
        }
      }
    }
  }

  return Array.from(nomes).filter(Boolean);
}

export const EditorDispositivosCard: React.FC<
  StandardEditorProps<MonitoredDevicesConfigGroup, any, PanelOptions>
> = ({ value, onChange, context }) => {
  const tema = useTheme2();
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [modoLoteAberto, setModoLoteAberto] = useState(false);
  const [textoLote, setTextoLote] = useState('');

  const opcoes = context?.options || ({} as Partial<PanelOptions>);
  const dispositivoAtivo = obterDispositivoAtivo(opcoes);
  const metaDispositivo = METADADOS_DISPOSITIVOS[dispositivoAtivo];
  const metricasCat = obterMetricasDisponiveisParaDispositivo(dispositivoAtivo);

  const grupo: MonitoredDevicesConfigGroup = value || {};
  const devices: MonitoredDeviceItem[] = Array.isArray(grupo.devices) ? grupo.devices : [];
  const groupInSingleCard: boolean = grupo.groupInSingleCard !== false;
  const consolidatedGroupMode: ConsolidatedGroupMode =
    grupo.consolidatedGroupMode || 'unico_card';

  const detectadosNaQuery = extrairNomesDispositivosDaQuery(context);

  const atualizarGrupo = (parcial: Partial<MonitoredDevicesConfigGroup>) => {
    onChange({
      devices,
      groupInSingleCard,
      consolidatedGroupMode,
      ...parcial,
    });
  };

  const prefixoPadrao =
    dispositivoAtivo === 'servidor'
      ? 'Servidor'
      : dispositivoAtivo === 'firewall'
      ? 'Firewall'
      : dispositivoAtivo === 'vm'
      ? 'VM'
      : dispositivoAtivo === 'host'
      ? 'Host'
      : dispositivoAtivo === 'proxy'
      ? 'Proxy'
      : dispositivoAtivo === 'access_point'
      ? 'AP'
      : dispositivoAtivo === 'porta_rede'
      ? 'Porta'
      : 'Dispositivo';

  const adicionarDispositivo = () => {
    const proximoNum = String(devices.length + 1).padStart(2, '0');
    const novo: MonitoredDeviceItem = {
      id: `dev_${Date.now()}_${devices.length}`,
      name: `${prefixoPadrao} ${proximoNum}`,
      hostFilter: '',
      enabled: true,
    };
    atualizarGrupo({ devices: [...devices, novo] });
  };

  const adicionarEmLote = (nomes: string[]) => {
    const limpos = nomes.map((n) => n.trim()).filter(Boolean);
    if (limpos.length === 0) {
      return;
    }
    const novos: MonitoredDeviceItem[] = limpos.map((nome, idx) => ({
      id: `dev_${Date.now()}_${devices.length + idx}`,
      name: nome,
      hostFilter: nome,
      enabled: true,
    }));
    atualizarGrupo({ devices: [...devices, ...novos] });
    setTextoLote('');
    setModoLoteAberto(false);
  };

  const gerarMultiplosPadrao = (quantidade: number) => {
    const inicio = devices.length + 1;
    const nomes: string[] = [];
    for (let i = 0; i < quantidade; i++) {
      const num = String(inicio + i).padStart(2, '0');
      nomes.push(`${prefixoPadrao} ${num}`);
    }
    adicionarEmLote(nomes);
  };

  const importarDaQuery = () => {
    if (detectadosNaQuery.length === 0) {
      return;
    }
    const nomesExistentes = new Set(devices.map((d) => d.name.toLowerCase()));
    const novosParaAdicionar = detectadosNaQuery.filter(
      (n) => !nomesExistentes.has(n.toLowerCase())
    );
    if (novosParaAdicionar.length > 0) {
      adicionarEmLote(novosParaAdicionar);
    }
  };

  const atualizarDispositivo = (id: string, parcial: Partial<MonitoredDeviceItem>) => {
    atualizarGrupo({
      devices: devices.map((d) => (d.id === id ? { ...d, ...parcial } : d)),
    });
  };

  const removerDispositivo = (id: string) => {
    atualizarGrupo({
      devices: devices.filter((d) => d.id !== id),
    });
  };

  const opcoesMetricasOverride: Array<SelectableValue<string>> = [
    { value: '', label: '✨ Usar métrica(s) padrão do painel' },
    ...metricasCat.map((m) => ({
      value: m.value,
      label: `${m.icone} ${m.label}`,
    })),
  ];

  const ativosCount = devices.filter((d) => d.enabled !== false).length;

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
        marginTop: 6,
        marginBottom: 8,
      }}
    >
      {/* Cabeçalho */}
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
          <span style={{ fontSize: 15 }}>🖥️</span>
          <span
            style={{
              fontWeight: 700,
              fontSize: 12,
              color: tema.colors.text.primary,
            }}
          >
            Múltiplos Dispositivos no Card
          </span>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 12,
            background:
              devices.length > 0
                ? `${metaDispositivo.corDestaque}22`
                : tema.colors.background.canvas,
            color:
              devices.length > 0
                ? metaDispositivo.corDestaque
                : tema.colors.text.secondary,
            border: `1px solid ${
              devices.length > 0
                ? `${metaDispositivo.corDestaque}55`
                : tema.colors.border.weak
            }`,
          }}
        >
          {devices.length > 0
            ? `${ativosCount} de ${devices.length} ativo(s)`
            : `✨ Auto (${detectadosNaQuery.length} na query)`}
        </span>
      </div>

      {/* Opções de Agrupamento em Card Único */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '8px 10px',
          borderRadius: 6,
          background: tema.colors.background.primary,
          border: `1px solid ${tema.colors.border.weak}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: tema.colors.text.primary }}>
              Exibir múltiplos dispositivos em um único card
            </div>
            <div style={{ fontSize: 11, color: tema.colors.text.secondary }}>
              Exibe todos os servidores/dispositivos individualmente dentro do mesmo card
            </div>
          </div>
          <Switch
            value={groupInSingleCard}
            onChange={(e) => atualizarGrupo({ groupInSingleCard: e.currentTarget.checked })}
          />
        </div>

        {(groupInSingleCard || opcoes.cardDisplayMode === 'consolidado') && (
          <Field
            label="Modo de Agrupamento do Card"
            description="Define como organizar quando houver vários dispositivos e/ou várias métricas"
            style={{ marginBottom: 0 }}
          >
            <Select
              options={OPCOES_AGRUPAMENTO_CONSOLIDADO}
              value={consolidatedGroupMode}
              onChange={(opt) =>
                atualizarGrupo({
                  consolidatedGroupMode:
                    (opt.value as ConsolidatedGroupMode) || 'unico_card',
                })
              }
            />
          </Field>
        )}
      </div>

      {/* Botões de Ação para Adicionar Dispositivos */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <Button
          size="sm"
          variant="primary"
          fill="outline"
          icon="plus"
          onClick={adicionarDispositivo}
        >
          Adicionar {prefixoPadrao}
        </Button>

        <Button
          size="sm"
          variant="secondary"
          fill="outline"
          onClick={() => setModoLoteAberto(!modoLoteAberto)}
        >
          📋 Adicionar Vários (10+)
        </Button>

        {detectadosNaQuery.length > 0 && (
          <Button
            size="sm"
            variant="secondary"
            fill="outline"
            onClick={importarDaQuery}
            title="Importa automaticamente os nomes dos hosts/séries retornados pela query do Zabbix"
          >
            📥 Importar da Query ({detectadosNaQuery.length})
          </Button>
        )}

        {devices.length > 0 && (
          <Button
            size="sm"
            variant="destructive"
            fill="text"
            onClick={() => atualizarGrupo({ devices: [] })}
          >
            Limpar Lista
          </Button>
        )}
      </div>

      {/* Painel de Adição em Lote (Ex: 10+ servidores de uma vez) */}
      {modoLoteAberto && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: 10,
            borderRadius: 6,
            background: tema.colors.background.primary,
            border: `1px solid ${metaDispositivo.corDestaque}`,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: tema.colors.text.primary }}>
            Adicionar Múltiplos Dispositivos de uma vez
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <Button
              size="sm"
              variant="secondary"
              fill="outline"
              onClick={() => gerarMultiplosPadrao(5)}
            >
              +5 {prefixoPadrao}s
            </Button>
            <Button
              size="sm"
              variant="secondary"
              fill="outline"
              onClick={() => gerarMultiplosPadrao(10)}
            >
              +10 {prefixoPadrao}s
            </Button>
            <Button
              size="sm"
              variant="secondary"
              fill="outline"
              onClick={() => gerarMultiplosPadrao(15)}
            >
              +15 {prefixoPadrao}s
            </Button>
          </div>
          <TextArea
            rows={3}
            value={textoLote}
            placeholder="Ou cole os nomes separados por vírgula ou linha (ex: SRV-AD-01, SRV-SQL-02, SRV-WEB-03...)"
            onChange={(e) => setTextoLote(e.currentTarget.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
            <Button
              size="sm"
              variant="secondary"
              fill="text"
              onClick={() => setModoLoteAberto(false)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() =>
                adicionarEmLote(
                  textoLote
                    .split(/[\n,;]+/)
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
            >
              Confirmar Adição
            </Button>
          </div>
        </div>
      )}

      {/* Lista de Dispositivos Cadastrados */}
      {devices.length > 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            maxHeight: 320,
            overflowY: 'auto',
            paddingRight: 2,
          }}
        >
          {devices.map((disp, idx) => {
            const estaExpandido = expandidoId === disp.id;
            return (
              <div
                key={disp.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 6,
                  background: tema.colors.background.primary,
                  border: `1px solid ${
                    estaExpandido
                      ? metaDispositivo.corDestaque
                      : tema.colors.border.weak
                  }`,
                  padding: '6px 8px',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Checkbox
                    value={disp.enabled !== false}
                    onChange={(e) =>
                      atualizarDispositivo(disp.id, {
                        enabled: e.currentTarget.checked,
                      })
                    }
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: tema.colors.text.secondary,
                      minWidth: 20,
                    }}
                  >
                    #{idx + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <Input
                      value={disp.name}
                      placeholder={`Nome do ${prefixoPadrao}`}
                      onChange={(e) =>
                        atualizarDispositivo(disp.id, { name: e.currentTarget.value })
                      }
                    />
                  </div>
                  <Button
                    size="sm"
                    variant={estaExpandido ? 'primary' : 'secondary'}
                    fill="text"
                    onClick={() =>
                      setExpandidoId(estaExpandido ? null : disp.id)
                    }
                    title="Configurar filtro Zabbix, gráfico ou cor individual deste dispositivo"
                  >
                    <Icon name={estaExpandido ? 'angle-up' : 'cog'} />
                  </Button>
                  <IconButton
                    name="trash-alt"
                    size="sm"
                    variant="destructive"
                    tooltip="Remover dispositivo"
                    onClick={() => removerDispositivo(disp.id)}
                  />
                </div>

                {estaExpandido && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      paddingTop: 8,
                      marginTop: 4,
                      borderTop: `1px solid ${tema.colors.border.weak}`,
                    }}
                  >
                    <Field
                      label="Filtro de Host / Série no Zabbix"
                      description="Nome do host no Zabbix ou RefId da query (ex: SRV-01, A, B). Se vazio, busca pelo nome acima ou pela ordem da série."
                      style={{ marginBottom: 0 }}
                    >
                      <Input
                        value={disp.hostFilter || ''}
                        placeholder={disp.name || 'Automático pelo nome / ordem'}
                        onChange={(e) =>
                          atualizarDispositivo(disp.id, {
                            hostFilter: e.currentTarget.value,
                          })
                        }
                      />
                    </Field>

                    <Field
                      label="Métrica Específica deste Dispositivo (Opcional)"
                      description="Deixe no padrão para usar a(s) métrica(s) selecionada(s) no painel"
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        options={opcoesMetricasOverride}
                        value={disp.metricOverride || ''}
                        onChange={(opt) =>
                          atualizarDispositivo(disp.id, {
                            metricOverride: (opt.value as AnyDeviceMetricType) || undefined,
                          })
                        }
                      />
                    </Field>

                    <Field
                      label="Gráfico Específico deste Dispositivo (Opcional)"
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        options={OPCOES_VARIACOES_GRAFICOS}
                        value={disp.chartTypeOverride || 'auto'}
                        onChange={(opt) =>
                          atualizarDispositivo(disp.id, {
                            chartTypeOverride: (opt.value as ChartType) || 'auto',
                          })
                        }
                      />
                    </Field>

                    <ControleCorComReset
                      label="Cor de Destaque deste Dispositivo"
                      valor={disp.customColor || ''}
                      corPadrao={metaDispositivo.corDestaque}
                      rotuloPadrao="Padrão do Dispositivo / Status"
                      onChange={(cor) =>
                        atualizarDispositivo(disp.id, { customColor: cor })
                      }
                      onReset={() =>
                        atualizarDispositivo(disp.id, { customColor: '' })
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            fontSize: 11,
            color: tema.colors.text.secondary,
            lineHeight: 1.35,
          }}
        >
          💡 <strong>Modo Automático:</strong> Todos os servidores/dispositivos retornados pela query do Zabbix já são identificados e exibidos automaticamente. Use os botões acima se quiser cadastrar, filtrar ou nomear manualmente seus dispositivos (ex: 10+ servidores) em um único card.
        </div>
      )}
    </div>
  );
};
