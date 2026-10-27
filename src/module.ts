import { PanelPlugin } from '@grafana/data';
import { PanelOptions } from './types';
import { SimplePanel } from './components/SimplePanel';

export const plugin = new PanelPlugin<PanelOptions>(SimplePanel).setPanelOptions((builder) => {
  return (
    builder
      // ==========================================
      // TIPO DE MONITORAMENTO (SELEÇÃO EM CASCATA)
      // ==========================================
      .addSelect({
        category: ['Tipo de Monitoramento'],
        path: 'panelType',
        name: 'Elemento de Monitoramento (Tipo de Painel)',
        description: 'Escolha a categoria do elemento monitorado para abrir as opções específicas',
        defaultValue: 'auto',
        settings: {
          options: [
            { value: 'auto', label: '🤖 Automático (Detectar pela Query)' },
            { value: 'disk', label: '💿 Monitoramento de Disco / Armazenamento' },
            { value: 'cpu', label: '📈 Monitoramento de CPU / Processador' },
            { value: 'memory', label: '🧠 Monitoramento de Memória RAM' },
            { value: 'network', label: '⚡ Monitoramento de Rede e Tráfego' },
            { value: 'status', label: '🌐 Conectividade e Status (Ping / Agent)' },
            { value: 'system', label: '🖥️ Sistema e Disponibilidade (Uptime / Host)' },
            { value: 'vmware', label: '📦 Virtualização (VMware vCenter / ESXi / VMs)' },
            { value: 'firewall', label: '🛡️ Firewall e Segurança (FortiGate)' },
          ],
        },
      })

      // 1. Subtipos: Monitoramento de Disco
      .addSelect({
        category: ['Tipo de Monitoramento'],
        path: 'diskMetricType',
        name: 'Métrica de Disco',
        description: 'Selecione o tipo de informação de disco a ser formatada e exibida',
        defaultValue: 'disk_usage_pct',
        showIf: (config) => config.panelType === 'disk',
        settings: {
          options: [
            { value: 'disk_usage_pct', label: 'Uso de disco (%)' },
            { value: 'disk_free_pct', label: 'Espaço livre (%)' },
            { value: 'disk_used_bytes', label: 'Espaço usado (GB / TB)' },
            { value: 'disk_free_bytes', label: 'Espaço livre (GB / TB)' },
            { value: 'disk_total_bytes', label: 'Capacidade total do disco (GB / TB)' },
            { value: 'disk_read_iops', label: 'IOPS de leitura (Disco / Datastore)' },
            { value: 'disk_write_latency', label: 'Latência de escrita (ms)' },
          ],
        },
      })

      // 2. Subtipos: Monitoramento de CPU
      .addSelect({
        category: ['Tipo de Monitoramento'],
        path: 'cpuMetricType',
        name: 'Métrica de CPU',
        description: 'Selecione o tipo de métrica de processador',
        defaultValue: 'cpu_usage_pct',
        showIf: (config) => config.panelType === 'cpu',
        settings: {
          options: [
            { value: 'cpu_usage_pct', label: 'Uso de CPU (%)' },
            { value: 'cpu_user_time', label: 'Tempo de usuário CPU (%)' },
            { value: 'cpu_system_time', label: 'Tempo de sistema / kernel (%)' },
            { value: 'cpu_queue_length', label: 'Fila de processador (CPU Queue Length)' },
            { value: 'cpu_ready_pct', label: 'CPU Ready / Contenção (%)' },
            { value: 'cpu_cores', label: 'Núcleos / vCPUs alocadas' },
          ],
        },
      })

      // 3. Subtipos: Monitoramento de Memória RAM
      .addSelect({
        category: ['Tipo de Monitoramento'],
        path: 'memoryMetricType',
        name: 'Métrica de Memória RAM',
        description: 'Selecione o tipo de informação de memória',
        defaultValue: 'mem_usage_pct',
        showIf: (config) => config.panelType === 'memory',
        settings: {
          options: [
            { value: 'mem_usage_pct', label: 'Uso de memória (%)' },
            { value: 'mem_free_pct', label: 'Memória livre (%)' },
            { value: 'mem_used_bytes', label: 'Memória utilizada (GB / MB)' },
            { value: 'mem_free_bytes', label: 'Memória livre (GB / MB)' },
            { value: 'mem_total_bytes', label: 'Memória total instalada (GB)' },
            { value: 'mem_swap_pct', label: 'Uso de Swap (%)' },
          ],
        },
      })

      // 4. Subtipos: Monitoramento de Rede
      .addSelect({
        category: ['Tipo de Monitoramento'],
        path: 'networkMetricType',
        name: 'Métrica de Rede',
        description: 'Selecione o tipo de indicador de tráfego ou conectividade de rede',
        defaultValue: 'net_traffic_in',
        showIf: (config) => config.panelType === 'network',
        settings: {
          options: [
            { value: 'net_traffic_in', label: 'Tráfego de entrada / Download (bps)' },
            { value: 'net_traffic_out', label: 'Tráfego de saída / Upload (bps)' },
            { value: 'net_packets_sec', label: 'Pacotes por segundo (pps)' },
            { value: 'net_errors_discards', label: 'Erros e descartes de pacotes' },
            { value: 'net_ping_latency', label: 'Latência ICMP / Ping (ms)' },
            { value: 'net_packet_loss', label: 'Perda de pacotes ICMP (%)' },
          ],
        },
      })

      // 5. Subtipos: Conectividade e Status
      .addSelect({
        category: ['Tipo de Monitoramento'],
        path: 'statusMetricType',
        name: 'Métrica de Status / Disponibilidade',
        description: 'Selecione o tipo de verificação de status (Online/Offline)',
        defaultValue: 'status_icmp_ping',
        showIf: (config) => config.panelType === 'status',
        settings: {
          options: [
            { value: 'status_icmp_ping', label: 'Status Acesso ICMP Ping (Online / Offline)' },
            { value: 'status_zabbix_agent', label: 'Status do Zabbix Agent (Online / Offline)' },
            { value: 'status_health_state', label: 'Saúde Geral do Equipamento (Health State)' },
          ],
        },
      })

      // 6. Subtipos: Sistema e Disponibilidade
      .addSelect({
        category: ['Tipo de Monitoramento'],
        path: 'systemMetricType',
        name: 'Métrica de Sistema',
        description: 'Selecione a informação de sistema do servidor ou equipamento',
        defaultValue: 'sys_uptime',
        showIf: (config) => config.panelType === 'system',
        settings: {
          options: [
            { value: 'sys_uptime', label: 'Tempo de atividade (System Uptime)' },
            { value: 'sys_hostname', label: 'Nome do Host (Hostname)' },
            { value: 'sys_power_watts', label: 'Consumo de energia elétrica (Watts)' },
            { value: 'sys_alarms_count', label: 'Incidentes e alarmes ativos' },
          ],
        },
      })

      // 7. Subtipos: Virtualização (VMware)
      .addSelect({
        category: ['Tipo de Monitoramento'],
        path: 'vmwareMetricType',
        name: 'Métrica de Virtualização (VMware)',
        description: 'Selecione o indicador de vCenter, Hypervisor ESXi ou VM',
        defaultValue: 'vm_power_state',
        showIf: (config) => config.panelType === 'vmware',
        settings: {
          options: [
            { value: 'vm_power_state', label: 'Estado da VM (Power State: Ligada / Desligada)' },
            { value: 'vm_guest_count', label: 'Total de Guest VMs (vCenter / Host)' },
            { value: 'vm_snapshots_count', label: 'Snapshots ativos na VM' },
            { value: 'vm_esxi_status', label: 'Status geral do Hypervisor ESXi' },
            { value: 'vm_vcpus', label: 'vCPUs alocadas na VM' },
            { value: 'vm_datastore_free_pct', label: 'Espaço livre no Datastore (%)' },
          ],
        },
      })

      // 8. Subtipos: Firewall (FortiGate)
      .addSelect({
        category: ['Tipo de Monitoramento'],
        path: 'firewallMetricType',
        name: 'Métrica de Firewall (FortiGate)',
        description: 'Selecione a métrica específica de segurança ou sessão do Firewall',
        defaultValue: 'fw_active_sessions',
        showIf: (config) => config.panelType === 'firewall',
        settings: {
          options: [
            { value: 'fw_active_sessions', label: 'Sessões concorrentes / ativas' },
            { value: 'fw_wan_bandwidth', label: 'Tráfego de banda WAN (Download / Upload)' },
            { value: 'fw_cpu_ram_corr', label: 'Uso de recursos do Firewall (%)' },
            { value: 'fw_uptime', label: 'Uptime do Firewall FortiGate' },
          ],
        },
      })

      .addBooleanSwitch({
        category: ['Tipo de Monitoramento'],
        path: 'overrideCardTitleWithPreset',
        name: 'Usar nome do tipo selecionado no card',
        description:
          'Se ativado, substitui o nome da métrica vinda do Zabbix pelo nome amigável selecionado acima',
        defaultValue: false,
        showIf: (config) => Boolean(config.panelType && config.panelType !== 'auto'),
      })

      // ==========================================
      // IDENTIFICAÇÃO E TÍTULO
      // ==========================================
      .addBooleanSwitch({
        category: ['Identificação'],
        path: 'showPanelTitle',
        name: 'Exibir título no painel',
        description: 'Exibe um cabeçalho customizado no topo dos blocos',
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

      // ==========================================
      // ESTILIZAÇÃO VISUAL
      // ==========================================
      .addColorPicker({
        category: ['Estilização Visual'],
        path: 'backgroundColor',
        name: 'Cor de fundo do painel',
        description: 'Deixe vazio para herdar a cor do tema do Grafana',
      })
      .addColorPicker({
        category: ['Estilização Visual'],
        path: 'cardBackgroundColor',
        name: 'Cor de fundo dos blocos (cards)',
        description: 'Deixe vazio para herdar o degradê escuro ou cor padrão',
      })
      .addColorPicker({
        category: ['Estilização Visual'],
        path: 'textColor',
        name: 'Cor do texto',
        description: 'Cor personalizada para títulos e valores das métricas',
      })
      .addColorPicker({
        category: ['Estilização Visual'],
        path: 'borderColor',
        name: 'Cor da borda dos blocos',
      })

      // ==========================================
      // TIPOGRAFIA
      // ==========================================
      .addSelect({
        category: ['Tipografia'],
        path: 'fontFamily',
        name: 'Família da fonte',
        description: 'Fonte aplicada aos textos e números do painel',
        defaultValue: 'default',
        settings: {
          options: [
            { value: 'default', label: 'Padrão Grafana' },
            { value: 'Inter', label: 'Inter' },
            { value: 'Roboto', label: 'Roboto' },
            { value: 'Open Sans', label: 'Open Sans' },
            { value: 'Montserrat', label: 'Montserrat' },
            { value: 'monospace', label: 'Monoespaçada' },
          ],
        },
      })
      .addRadio({
        category: ['Tipografia'],
        path: 'fontSize',
        name: 'Tamanho da fonte',
        description: 'Escala de tamanho dos textos e métricas',
        defaultValue: 'md',
        settings: {
          options: [
            { value: 'sm', label: 'Pequeno (SM)' },
            { value: 'md', label: 'Médio (MD)' },
            { value: 'lg', label: 'Grande (LG)' },
            { value: 'xl', label: 'Extra Grande (XL)' },
          ],
        },
      })

      // ==========================================
      // LIMIARES E COMPORTAMENTO
      // ==========================================
      .addNumberInput({
        category: ['Limiares e Status'],
        path: 'thresholdWarning',
        name: 'Limiar de Atenção (%)',
        description: 'Percentual para acionar status de Atenção (âmbar)',
        defaultValue: 70,
      })
      .addNumberInput({
        category: ['Limiares e Status'],
        path: 'thresholdCritical',
        name: 'Limiar Crítico (%)',
        description: 'Percentual para acionar status Crítico (vermelho)',
        defaultValue: 85,
      })
      .addBooleanSwitch({
        category: ['Limiares e Status'],
        path: 'showStatusBadge',
        name: 'Exibir crachá de status',
        description: 'Exibe tag indicativa (ex.: ONLINE, NORMAL, ATENÇÃO, CRÍTICO)',
        defaultValue: true,
      })
      .addBooleanSwitch({
        category: ['Limiares e Status'],
        path: 'showProgressBar',
        name: 'Exibir barra de progresso',
        description: 'Exibe barra colorida em métricas percentuais (CPU, RAM, Discos)',
        defaultValue: true,
      })

      // ==========================================
      // LAYOUT DOS BLOCOS
      // ==========================================
      .addRadio({
        category: ['Layout dos Blocos'],
        path: 'columns',
        name: 'Distribuição de colunas',
        defaultValue: 'auto',
        settings: {
          options: [
            { value: 'auto', label: 'Automático (Responsivo)' },
            { value: '1', label: '1 Coluna' },
            { value: '2', label: '2 Colunas' },
            { value: '3', label: '3 Colunas' },
            { value: '4', label: '4 Colunas' },
          ],
        },
      })
      .addBooleanSwitch({
        category: ['Layout dos Blocos'],
        path: 'showSparkline',
        name: 'Exibir minigráfico (Sparkline)',
        description: 'Exibe a linha de tendência histórica recente dentro do card',
        defaultValue: true,
      })
      .addColorPicker({
        category: ['Layout dos Blocos'],
        path: 'sparklineColor',
        name: 'Cor do minigráfico',
        description: 'Cor da linha de tendência nos blocos',
        showIf: (config) => Boolean(config.showSparkline),
      })

      // ==========================================
      // COMPATIBILIDADE E TESTES
      // ==========================================
      .addBooleanSwitch({
        category: ['Avançado'],
        path: 'showSeriesCount',
        name: 'Show series counter',
        defaultValue: false,
      })
  );
});
