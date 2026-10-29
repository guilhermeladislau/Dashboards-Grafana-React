import { PanelPlugin } from '@grafana/data';
import { PanelOptions } from './types';
import {
  PainelPrincipal,
  EditorStandardOptions,
  EditorEstilizacaoVisual,
  EditorSelecaoMetricas,
  EditorEstilizacaoMetricas,
  EditorDispositivosCard,
} from './components';
import { estaEmModoMultiplasMetricas } from './utilitarios/preconfiguracoesDispositivos';

export const plugin = new PanelPlugin<PanelOptions>(PainelPrincipal)
  .setPanelOptions((builder) => {
    return (
      builder
        // =====================================================================
        // 1. SELEÇÃO DO DISPOSITIVO E MODO DO CARD
        // =====================================================================
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
            'Escolha entre exibir um card individual por métrica ou agrupar várias métricas dentro de um único card do dispositivo',
          defaultValue: 'individual',
          settings: {
            options: [
              { value: 'individual', label: '1 Métrica por Card (Grade)' },
              { value: 'consolidado', label: 'Várias Métricas no Mesmo Card' },
            ],
          },
        })

        .addSelect({
          category: ['Dispositivo e Monitoramento'],
          path: 'maxDevices',
          name: 'Quantidade de Dispositivos / Métricas Monitoradas',
          description:
            'Limite de dispositivos ou métricas exibidas no card/painel (selecione "Todos" para ilimitado)',
          defaultValue: 0,
          settings: {
            options: [
              { value: 0, label: '✨ Todos os Dispositivos (Sem Limite)' },
              { value: 1, label: '1 Dispositivo' },
              { value: 2, label: '2 Dispositivos' },
              { value: 3, label: '3 Dispositivos' },
              { value: 4, label: '4 Dispositivos' },
              { value: 5, label: '5 Dispositivos' },
              { value: 6, label: '6 Dispositivos' },
              { value: 8, label: '8 Dispositivos' },
              { value: 10, label: '10 Dispositivos' },
              { value: 12, label: '12 Dispositivos' },
              { value: 16, label: '16 Dispositivos' },
              { value: 20, label: '20 Dispositivos' },
              { value: 30, label: '30 Dispositivos' },
              { value: 50, label: '50 Dispositivos' },
            ],
          },
        })

        // =====================================================================
        // 2. O QUE MONITORAR POR DISPOSITIVO (MÉTRICAS PRÉ-CONFIGURADAS)
        // =====================================================================

        // 2.1 Firewall
        .addSelect({
          category: ['Dispositivo e Monitoramento'],
          path: 'firewallMetric',
          name: 'O que Monitorar no Firewall',
          description: 'Métrica pré-configurada com unidade, ícone, gráfico e limiares ideais',
          defaultValue: 'fw_cpu',
          showIf: (config) => config.deviceType === 'firewall',
          settings: {
            options: [
              { value: 'auto_device', label: '✨ Detectar Automaticamente (Múltiplas Métricas)' },
              { value: 'fw_status', label: '🛡️ Status do Firewall (Online / Offline)' },
              { value: 'fw_cpu', label: '📈 Uso de CPU do Firewall (%)' },
              { value: 'fw_memoria', label: '🧠 Uso de Memória do Firewall (%)' },
              { value: 'fw_sessoes', label: '👥 Sessões Concorrentes Ativas' },
              { value: 'fw_trafego_wan_in', label: '⬇️ Tráfego WAN Download / Entrada (bps)' },
              { value: 'fw_trafego_wan_out', label: '⬆️ Tráfego WAN Upload / Saída (bps)' },
              { value: 'fw_vpn_status', label: '🔒 Status de Túneis VPN (IPsec / SSL)' },
              { value: 'fw_ameacas_bloqueadas', label: '🚨 Ameaças / Ataques Bloqueados (IPS)' },
              { value: 'fw_uptime', label: '⏱️ Tempo de Atividade (Uptime)' },
            ],
          },
        })

        // 2.2 Máquina Virtual (VM)
        .addSelect({
          category: ['Dispositivo e Monitoramento'],
          path: 'vmMetric',
          name: 'O que Monitorar na VM',
          description: 'Métrica pré-configurada para Máquinas Virtuais',
          defaultValue: 'vm_cpu_uso',
          showIf: (config) => config.deviceType === 'vm',
          settings: {
            options: [
              { value: 'auto_device', label: '✨ Detectar Automaticamente (Múltiplas Métricas)' },
              { value: 'vm_estado', label: '📦 Estado da VM (Ligada / Desligada)' },
              { value: 'vm_cpu_uso', label: '📈 Uso de vCPU da VM (%)' },
              { value: 'vm_cpu_ready', label: '⚡ CPU Ready / Contenção (%)' },
              { value: 'vm_memoria_uso', label: '🧠 Uso de Memória RAM da VM (%)' },
              { value: 'vm_disco_usado', label: '💿 Espaço em Disco Usado (%)' },
              { value: 'vm_disco_livre', label: '💾 Espaço em Disco Livre (GB / TB)' },
              { value: 'vm_iops', label: '🔄 IOPS de Disco Virtual' },
              { value: 'vm_snapshots', label: '📸 Snapshots Ativos na VM' },
              { value: 'vm_rede', label: '🌐 Tráfego de Rede vNIC (bps)' },
              { value: 'vm_uptime', label: '⏱️ Uptime da VM' },
            ],
          },
        })

        // 2.3 Proxy
        .addSelect({
          category: ['Dispositivo e Monitoramento'],
          path: 'proxyMetric',
          name: 'O que Monitorar no Proxy',
          description: 'Métrica pré-configurada para Servidores Proxy e Balanceadores',
          defaultValue: 'proxy_requisicoes_seg',
          showIf: (config) => config.deviceType === 'proxy',
          settings: {
            options: [
              { value: 'auto_device', label: '✨ Detectar Automaticamente (Múltiplas Métricas)' },
              { value: 'proxy_status', label: '🌐 Status do Serviço Proxy (Online / Offline)' },
              { value: 'proxy_requisicoes_seg', label: '⚡ Requisições por Segundo (req/s)' },
              { value: 'proxy_cache_hit', label: '🎯 Taxa de Cache Hit (%)' },
              { value: 'proxy_latencia', label: '⏱️ Latência / Tempo de Resposta HTTP (ms)' },
              { value: 'proxy_conexoes_ativas', label: '👥 Conexões / Clientes Ativos' },
              { value: 'proxy_banda', label: '📶 Consumo de Banda do Proxy (bps)' },
              { value: 'proxy_cpu', label: '📈 Uso de CPU do Proxy (%)' },
              { value: 'proxy_memoria', label: '🧠 Uso de Memória do Proxy (%)' },
              { value: 'proxy_erros_http', label: '⚠️ Erros HTTP (4xx / 5xx)' },
            ],
          },
        })

        // 2.4 Host / Hipervisor
        .addSelect({
          category: ['Dispositivo e Monitoramento'],
          path: 'hostMetric',
          name: 'O que Monitorar no Host',
          description: 'Métrica pré-configurada para Hosts Físicos e Hipervisores',
          defaultValue: 'host_cpu_uso',
          showIf: (config) => config.deviceType === 'host',
          settings: {
            options: [
              { value: 'auto_device', label: '✨ Detectar Automaticamente (Múltiplas Métricas)' },
              { value: 'host_status', label: '🖧 Status do Host / Hipervisor (Online / Offline)' },
              { value: 'host_saude', label: '🩺 Saúde Geral do Hardware (Health State)' },
              { value: 'host_cpu_uso', label: '📈 Uso de CPU Física (%)' },
              { value: 'host_memoria_uso', label: '🧠 Uso de Memória Física (%)' },
              { value: 'host_datastore_uso', label: '💿 Uso de Datastore / Storage (%)' },
              { value: 'host_datastore_livre', label: '💾 Espaço Livre no Datastore (GB / TB)' },
              { value: 'host_vms_ativas', label: '📦 Total de VMs Hospedadas no Host' },
              { value: 'host_temperatura', label: '🌡️ Temperatura do Hardware (°C)' },
              { value: 'host_energia', label: '⚡ Consumo Elétrico (Watts)' },
              { value: 'host_uptime', label: '⏱️ Uptime do Host' },
            ],
          },
        })

        // 2.5 Servidores (Windows / Linux)
        .addSelect({
          category: ['Dispositivo e Monitoramento'],
          path: 'servidorMetric',
          name: 'O que Monitorar no Servidor',
          description: 'Métrica pré-configurada para Servidores Windows e Linux',
          defaultValue: 'srv_cpu_uso',
          showIf: (config) => config.deviceType === 'servidor',
          settings: {
            options: [
              { value: 'auto_device', label: '✨ Detectar Automaticamente (Múltiplas Métricas)' },
              { value: 'srv_status_ping', label: '🌐 Conectividade ICMP Ping (Online / Offline)' },
              { value: 'srv_status_agent', label: '🛡️ Status do Zabbix Agent (Online / Offline)' },
              { value: 'srv_cpu_uso', label: '📈 Uso de CPU do Servidor (%)' },
              { value: 'srv_cpu_fila', label: '📊 Fila de Processador (CPU Queue)' },
              { value: 'srv_memoria_uso', label: '🧠 Uso de Memória RAM (%)' },
              { value: 'srv_memoria_livre', label: '🧠 Memória RAM Livre (GB)' },
              { value: 'srv_disco_uso', label: '💿 Uso de Disco / Partição (%)' },
              { value: 'srv_disco_livre', label: '💾 Espaço Livre em Disco (GB / TB)' },
              { value: 'srv_disco_latencia', label: '⏱️ Latência de Disco (ms)' },
              { value: 'srv_rede_trafego', label: '⚡ Tráfego de Rede do Servidor (bps)' },
              { value: 'srv_servicos_parados', label: '🚨 Serviços Parados / Incidentes' },
              { value: 'srv_uptime', label: '⏱️ Uptime do Servidor' },
            ],
          },
        })

        // 2.6 Access Points (Wi-Fi)
        .addSelect({
          category: ['Dispositivo e Monitoramento'],
          path: 'accessPointMetric',
          name: 'O que Monitorar no Access Point',
          description: 'Métrica pré-configurada para Pontos de Acesso Wi-Fi',
          defaultValue: 'ap_clientes',
          showIf: (config) => config.deviceType === 'access_point',
          settings: {
            options: [
              { value: 'auto_device', label: '✨ Detectar Automaticamente (Múltiplas Métricas)' },
              { value: 'ap_status', label: '📡 Status do Access Point (Online / Offline)' },
              { value: 'ap_clientes', label: '📱 Clientes Wi-Fi Conectados' },
              { value: 'ap_sinal_qualidade', label: '📶 Qualidade do Sinal Wi-Fi (%)' },
              { value: 'ap_sinal_dbm', label: '📡 Potência de Sinal / RSSI (dBm)' },
              { value: 'ap_interferencia', label: '🌊 Ocupação do Canal / Interferência (%)' },
              { value: 'ap_trafego_in', label: '⬇️ Tráfego Wi-Fi Download (bps)' },
              { value: 'ap_trafego_out', label: '⬆️ Tráfego Wi-Fi Upload (bps)' },
              { value: 'ap_cpu', label: '📈 Uso de CPU do Access Point (%)' },
              { value: 'ap_uptime', label: '⏱️ Uptime do Access Point' },
            ],
          },
        })

        // 2.7 Portas de Rede / Switch
        .addSelect({
          category: ['Dispositivo e Monitoramento'],
          path: 'portaRedeMetric',
          name: 'O que Monitorar na Porta de Rede',
          description: 'Métrica pré-configurada para Portas de Switch e Interfaces de Roteador',
          defaultValue: 'porta_trafego_in',
          showIf: (config) => config.deviceType === 'porta_rede',
          settings: {
            options: [
              { value: 'auto_device', label: '✨ Detectar Automaticamente (Múltiplas Métricas)' },
              { value: 'porta_status', label: '🔌 Status da Porta (UP / DOWN)' },
              { value: 'porta_trafego_in', label: '⬇️ Tráfego de Entrada / RX (bps)' },
              { value: 'porta_trafego_out', label: '⬆️ Tráfego de Saída / TX (bps)' },
              { value: 'porta_utilizacao_pct', label: '📊 Utilização da Banda da Porta (%)' },
              { value: 'porta_pacotes_seg', label: '📦 Fluxo de Pacotes por Segundo (pps)' },
              { value: 'porta_erros', label: '⚠️ Erros CRC / Descartes na Porta' },
              { value: 'porta_velocidade', label: '⚡ Velocidade Negociada (100M / 1G / 10G)' },
              { value: 'porta_poe_watts', label: '🔋 Consumo PoE da Porta (Watts)' },
            ],
          },
        })

        // =====================================================================
        // 2.8 SELEÇÃO DE MÚLTIPLAS MÉTRICAS E ESTILIZAÇÃO INDIVIDUAL (PARALELA)
        // =====================================================================
        .addCustomEditor({
          id: 'selectedMetricsEditor',
          path: 'selectedMetrics',
          name: 'Quais Métricas Monitorar',
          description:
            'Selecione uma ou mais métricas específicas para monitorar no card (habilitado ao selecionar Várias Métricas)',
          category: ['Dispositivo e Monitoramento'],
          editor: EditorSelecaoMetricas,
          defaultValue: [],
          showIf: (config) => estaEmModoMultiplasMetricas(config),
        })

        .addCustomEditor({
          id: 'metricStylesEditor',
          path: 'metricStyles',
          name: 'Estilizar Métricas Individualmente',
          description:
            'Personalize gráfico, cores, limiares, unidade e título para cada métrica monitorada individualmente',
          category: ['Dispositivo e Monitoramento'],
          editor: EditorEstilizacaoMetricas,
          defaultValue: {},
          showIf: (config) => estaEmModoMultiplasMetricas(config),
        })

        // =====================================================================
        // 2.9 MÚLTIPLOS DISPOSITIVOS NO CARD (EX: 10+ SERVIDORES EM UM ÚNICO CARD)
        // =====================================================================
        .addCustomEditor({
          id: 'monitoredDevicesConfigEditor',
          path: 'monitoredDevicesConfig',
          name: 'Dispositivos Monitorados no Card',
          description:
            'Adicione múltiplos dispositivos (ex: 10+ servidores) para exibir o monitoramento individual de todos dentro de um único card',
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

        // =====================================================================
        // 3. SUBCATEGORIA: STANDARD OPTIONS (COLLAPSIBLE DRAWER)
        // =====================================================================
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

        // =====================================================================
        // 4. ESTILIZAÇÃO VISUAL (SUBRETRAIS: GRÁFICOS, PAINEL E FONTES)
        // =====================================================================
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
            columns: 'auto',
            showStatusBadge: true,
            fontFamily: 'default',
            fontSize: 'md',
          },
        })

        // =====================================================================
        // 5. IDENTIFICAÇÃO E TÍTULO
        // =====================================================================
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

        // =====================================================================
        // 6. AVANÇADO / TESTES E2E
        // =====================================================================
        .addBooleanSwitch({
          category: ['Avançado'],
          path: 'showSeriesCount',
          name: 'Show series counter',
          defaultValue: false,
        })
    );
  });
