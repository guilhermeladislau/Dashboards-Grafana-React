import { PanelPlugin } from '@grafana/data';
import { PanelOptions } from './types';
import {
  PainelPrincipal,
  EditorStandardOptions,
  EditorEstilizacaoVisual,
  EditorSelecaoMetricas,
  EditorEstilizacaoMetricas,
  EditorDispositivosCard,
  EditorBlocosMetricas,
} from './components';

export const plugin = new PanelPlugin<PanelOptions>(PainelPrincipal)
  .setPanelOptions((builder) => {
    return builder
      .addSelect({
        category: ['Dispositivo e Monitoramento'],
        path: 'deviceType',
        name: 'Tipo de Dispositivo',
        description:
          'Selecione o dispositivo monitorado para carregar os componentes e métricas pré-configuradas',
        defaultValue: 'auto',
        settings: {
          options: [
            { value: 'auto', label: '🤖 Automático (Detectar pela Query)' },
            { value: 'firewall', label: '🛡️ Firewall (FortiGate / Sophos / pfSense)' },
            { value: 'vm', label: '📦 Máquina Virtual (VM)' },
            { value: 'proxy', label: '🌐 Servidor Proxy (Squid / Nginx / HAProxy)' },
            { value: 'host', label: '🖧 Host / Hipervisor (ESXi / Proxmox / Hyper-V)' },
            { value: 'servidor', label: '🖥️ Servidor (Windows / Linux)' },
            { value: 'access_point', label: '📡 Access Point (Wi-Fi / Ubiquiti / Aruba)' },
            { value: 'porta_rede', label: '🔌 Porta de Rede / Switch (Interface)' },
          ],
        },
      })
      .addRadio({
        category: ['Dispositivo e Monitoramento'],
        path: 'cardDisplayMode',
        name: 'Modo de Exibição do Card',
        description:
          'Cada dispositivo agrupa suas respectivas métricas. Escolha como organizar os cards no painel',
        defaultValue: 'individual',
        settings: {
          options: [
            { value: 'individual', label: '1 Card por Dispositivo (Métricas no Card)' },
            { value: 'consolidado', label: 'Agrupar Todos em 1 Único Card' },
            { value: 'metricas_separadas', label: '1 Card por Métrica (Isoladas)' },
          ],
        },
      })
      .addTextInput({
        category: ['Dispositivo e Monitoramento'],
        path: 'maxDevices',
        name: 'Quantidade de Dispositivos / Métricas Monitoradas',
        description:
          'Quantidade máxima exibida no painel. Com vários dispositivos, limita os dispositivos; com um único dispositivo, limita as métricas. Vazio ou 0 = sem limite',
        defaultValue: '',
        settings: {
          placeholder: 'Ex.: 5 (vazio ou 0 = todos)',
        },
      })
      .addCustomEditor({
        id: 'selectedMetricsEditor',
        path: 'selectedMetrics',
        name: 'Quais Métricas Monitorar',
        description:
          'Selecione as métricas do dispositivo a monitorar. Sem seleção manual, o painel exibe as métricas detectadas na query',
        category: ['Dispositivo e Monitoramento'],
        editor: EditorSelecaoMetricas,
        defaultValue: [],
      })
      .addCustomEditor({
        id: 'metricStylesEditor',
        path: 'metricStyles',
        name: 'Estilizar Métricas Individualmente',
        description:
          'Personalize gráfico, cores, limiares, unidade e título de cada métrica',
        category: ['Dispositivo e Monitoramento'],
        editor: EditorEstilizacaoMetricas,
        defaultValue: {},
      })
      .addCustomEditor({
        id: 'monitoredDevicesConfigEditor',
        path: 'monitoredDevicesConfig',
        name: 'Dispositivos Monitorados no Card',
        description:
          'Adicione múltiplos dispositivos para exibir o monitoramento de todos dentro de um mesmo card',
        category: ['Dispositivo e Monitoramento'],
        editor: EditorDispositivosCard,
        defaultValue: {
          devices: [],
          groupInSingleCard: true,
          consolidatedGroupMode: 'unico_card',
        },
      })
      .addBooleanSwitch({
        category: ['Dispositivo e Monitoramento'],
        path: 'overrideCardTitleWithPreset',
        name: 'Usar nome amigável pré-configurado da métrica',
        description:
          'Quando ativo, exibe o título em português da métrica escolhida ao invés do nome técnico bruto do Zabbix',
        defaultValue: true,
      })
      .addCustomEditor({
        id: 'standardOptionsCollapsible',
        path: 'standardOptions',
        name: '',
        category: ['Dispositivo e Monitoramento'],
        editor: EditorStandardOptions,
        defaultValue: {
          unit: 'auto',
          decimalsAuto: true,
          customDecimals: 0,
          displayName: '',
          prefix: '',
          suffix: '',
          min: 0,
          max: 100,
          noValue: '-',
        },
      })
      .addCustomEditor({
        id: 'blockOverridesEditor',
        path: 'blockOverrides',
        name: '',
        category: ['Dispositivo e Monitoramento'],
        editor: EditorBlocosMetricas,
        defaultValue: {},
      })
      .addCustomEditor({
        id: 'estilizacaoVisualCollapsible',
        path: 'estilizacaoVisual',
        name: '',
        category: ['Estilização Visual'],
        editor: EditorEstilizacaoVisual,
        defaultValue: {
          chartType: 'auto',
          sparklineColor: '',
          showProgressBar: true,
          showSparkline: true,
          thresholdMode: 'auto',
          thresholdWarning: 70,
          thresholdCritical: 85,
          colorOk: '',
          colorWarning: '',
          colorCritical: '',
          fixedMetricColor: '',
          backgroundColor: '',
          cardBackgroundColor: '',
          textColor: '',
          borderColor: '',
          blockSize: 'md',
          blockHeight: 0,
          cardWidth: 0,
          cardHeight: 0,
          columns: 'auto',
          showStatusBadge: true,
          fontFamily: 'default',
          fontSize: 'md',
        },
      })
      .addTextInput({
        category: ['Identificação'],
        path: 'deviceName',
        name: 'Etiqueta / Nome do Dispositivo',
        description:
          'Exibido no topo do bloco (ex.: FortiGate Matriz, ESXi-01, Switch Core). Suporta variáveis como $host',
        defaultValue: '',
      })
      .addBooleanSwitch({
        category: ['Identificação'],
        path: 'showPanelTitle',
        name: 'Exibir título geral no painel',
        description: 'Exibe um cabeçalho customizado no topo do painel',
        defaultValue: false,
      })
      .addTextInput({
        category: ['Identificação'],
        path: 'panelTitle',
        name: 'Título do painel',
        description: 'Texto de cabeçalho exibido acima dos blocos',
        defaultValue: 'Monitoramento de Infraestrutura',
        showIf: (config) => Boolean(config.showPanelTitle),
      })
      .addBooleanSwitch({
        category: ['Avançado'],
        path: 'showSeriesCount',
        name: 'Show series counter',
        defaultValue: false,
      });
  });
