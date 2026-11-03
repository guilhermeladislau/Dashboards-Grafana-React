export type FontSize = 'sm' | 'md' | 'lg' | 'xl';
export type FontFamily = 'default' | 'Inter' | 'Roboto' | 'Open Sans' | 'Montserrat' | 'monospace';
export type LayoutColumns = 'auto' | '1' | '2' | '3' | '4';

export type MetricCategory =
  | 'status'
  | 'uptime'
  | 'percentage'
  | 'disk'
  | 'bytes'
  | 'traffic'
  | 'latency'
  | 'counter'
  | 'generic';

export type MetricStatusLevel = 'ok' | 'warning' | 'critical' | 'offline' | 'info';

/**
 * Tipos de Dispositivos Monitorados
 */
export type DeviceType =
  | 'auto'
  | 'firewall'
  | 'vm'
  | 'proxy'
  | 'host'
  | 'servidor'
  | 'access_point'
  | 'porta_rede';

/**
 * Modo de Exibição dos Cards no Painel
 * - individual: 1 card por dispositivo (agrupando todas as métricas daquele dispositivo)
 * - consolidado: Agrupa todos os dispositivos e métricas em um único card consolidado
 * - metricas_separadas: Exibe cada métrica em um card isolado na grade
 */
export type CardDisplayMode = 'individual' | 'consolidado' | 'metricas_separadas';

/**
 * Modo de agrupamento quando há múltiplos dispositivos e/ou métricas no card consolidado
 * - unico_card: Todos os dispositivos e métricas dentro de um único card
 * - por_metrica: Um card consolidado para cada métrica (contendo todos os dispositivos)
 * - por_dispositivo: Um card consolidado para cada dispositivo (contendo todas as métricas dele)
 */
export type ConsolidatedGroupMode = 'unico_card' | 'por_metrica' | 'por_dispositivo';

/**
 * Tipos de Gráfico suportados (estilo Stat / Gauge / Bar do Grafana)
 */
export type ChartType =
  | 'auto'
  | 'barra'
  | 'circulo'
  | 'arco'
  | 'anel'
  | 'torre'
  | 'area'
  | 'linha'
  | 'bullet'
  | 'termometro'
  | 'nenhum';

/**
 * Tamanhos do Bloco de Monitoramento (Cards)
 */
export type BlockSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Unidades de Medida do Standard Options integrado
 */
export type StandardUnitType =
  | 'auto'
  | 'percent'
  | 'percent_unit'
  | 'bytes'
  | 'bps'
  | 'pps'
  | 'reqps'
  | 'iops'
  | 'ms'
  | 'segundos'
  | 'minutos'
  | 'horas'
  | 'dias'
  | 'uptime'
  | 'watts'
  | 'kw'
  | 'celsius'
  | 'fahrenheit'
  | 'dbm'
  | 'db'
  | 'clientes'
  | 'status'
  | 'status_vm'
  | 'status_porta'
  | 'saude'
  | 'numero'
  | 'texto';

/**
 * Modo de avaliação dos limiares (Thresholds)
 */
export type ThresholdMode = 'auto' | 'normal' | 'invertido' | 'fixo';

/**
 * Métricas específicas por Dispositivo
 */
export type FirewallMetricType =
  | 'auto_device'
  | 'fw_status'
  | 'fw_cpu'
  | 'fw_memoria'
  | 'fw_sessoes'
  | 'fw_trafego_wan_in'
  | 'fw_trafego_wan_out'
  | 'fw_vpn_status'
  | 'fw_ameacas_bloqueadas'
  | 'fw_uptime'
  // Legado
  | 'fw_active_sessions'
  | 'fw_wan_bandwidth'
  | 'fw_cpu_ram_corr';

export type VmMetricType =
  | 'auto_device'
  | 'vm_estado'
  | 'vm_cpu_uso'
  | 'vm_cpu_ready'
  | 'vm_memoria_uso'
  | 'vm_disco_usado'
  | 'vm_disco_livre'
  | 'vm_iops'
  | 'vm_snapshots'
  | 'vm_rede'
  | 'vm_uptime'
  // Legado
  | 'vm_power_state'
  | 'vm_guest_count'
  | 'vm_snapshots_count'
  | 'vm_esxi_status'
  | 'vm_vcpus'
  | 'vm_datastore_free_pct';

export type ProxyMetricType =
  | 'auto_device'
  | 'proxy_status'
  | 'proxy_requisicoes_seg'
  | 'proxy_cache_hit'
  | 'proxy_latencia'
  | 'proxy_conexoes_ativas'
  | 'proxy_banda'
  | 'proxy_cpu'
  | 'proxy_memoria'
  | 'proxy_erros_http';

export type HostMetricType =
  | 'auto_device'
  | 'host_status'
  | 'host_saude'
  | 'host_cpu_uso'
  | 'host_memoria_uso'
  | 'host_datastore_uso'
  | 'host_datastore_livre'
  | 'host_vms_ativas'
  | 'host_temperatura'
  | 'host_energia'
  | 'host_uptime';

export type ServidorMetricType =
  | 'auto_device'
  | 'srv_status_ping'
  | 'srv_status_agent'
  | 'srv_cpu_uso'
  | 'srv_cpu_fila'
  | 'srv_memoria_uso'
  | 'srv_memoria_livre'
  | 'srv_disco_uso'
  | 'srv_disco_livre'
  | 'srv_disco_latencia'
  | 'srv_rede_trafego'
  | 'srv_servicos_parados'
  | 'srv_uptime';

export type AccessPointMetricType =
  | 'auto_device'
  | 'ap_status'
  | 'ap_clientes'
  | 'ap_sinal_qualidade'
  | 'ap_sinal_dbm'
  | 'ap_interferencia'
  | 'ap_trafego_in'
  | 'ap_trafego_out'
  | 'ap_cpu'
  | 'ap_uptime';

export type PortaRedeMetricType =
  | 'auto_device'
  | 'porta_status'
  | 'porta_trafego_in'
  | 'porta_trafego_out'
  | 'porta_utilizacao_pct'
  | 'porta_pacotes_seg'
  | 'porta_erros'
  | 'porta_velocidade'
  | 'porta_poe_watts';

// Tipos legados mantidos para compatibilidade
export type MonitoringPanelType =
  | 'auto'
  | 'disk'
  | 'cpu'
  | 'memory'
  | 'network'
  | 'status'
  | 'system'
  | 'vmware'
  | 'firewall';

export type DiskMetricSubType =
  | 'disk_usage_pct'
  | 'disk_free_pct'
  | 'disk_used_bytes'
  | 'disk_free_bytes'
  | 'disk_total_bytes'
  | 'disk_read_iops'
  | 'disk_write_latency';

export type CpuMetricSubType =
  | 'cpu_usage_pct'
  | 'cpu_user_time'
  | 'cpu_system_time'
  | 'cpu_queue_length'
  | 'cpu_ready_pct'
  | 'cpu_cores';

export type MemoryMetricSubType =
  | 'mem_usage_pct'
  | 'mem_free_pct'
  | 'mem_used_bytes'
  | 'mem_free_bytes'
  | 'mem_total_bytes'
  | 'mem_swap_pct';

export type NetworkMetricSubType =
  | 'net_traffic_in'
  | 'net_traffic_out'
  | 'net_packets_sec'
  | 'net_errors_discards'
  | 'net_ping_latency'
  | 'net_packet_loss';

export type StatusMetricSubType =
  | 'status_icmp_ping'
  | 'status_zabbix_agent'
  | 'status_health_state';

export type SystemMetricSubType =
  | 'sys_uptime'
  | 'sys_hostname'
  | 'sys_power_watts'
  | 'sys_alarms_count';

export type VmwareMetricSubType = VmMetricType;

export type AnyDeviceMetricType =
  | FirewallMetricType
  | VmMetricType
  | ProxyMetricType
  | HostMetricType
  | ServidorMetricType
  | AccessPointMetricType
  | PortaRedeMetricType
  | DiskMetricSubType
  | CpuMetricSubType
  | MemoryMetricSubType
  | NetworkMetricSubType
  | StatusMetricSubType
  | SystemMetricSubType;

export type AnyMetricSubType = AnyDeviceMetricType;

export interface MetricDataPoint {
  time?: number;
  value: number | string | null;
}

export interface MetricBlockItem {
  id: string;
  title: string;
  deviceName?: string;
  metricName?: string;
  metricKey?: string;
  currentValue: number | string | null;
  displayValue: string;
  unit: string;
  points: MetricDataPoint[];
  color?: string;
  sparklineColor?: string;
  thresholdWarning?: number;
  thresholdCritical?: number;
  showStatusBadge?: boolean;
  category: MetricCategory;
  statusLevel: MetricStatusLevel;
  statusBadge?: string;
  subText?: string;
  percentage?: number;
  statusColor?: string;
  icon?: string;
  deviceType: DeviceType;
  chartType: Exclude<ChartType, 'auto'>;
}

/**
 * Configuração de estilização individual para uma métrica específica
 */
export interface MetricStyleOverride {
  metricKey: string;
  displayName?: string;
  seriesFilter?: string;
  chartType?: ChartType;
  unit?: StandardUnitType;
  decimalsAuto?: boolean;
  customDecimals?: number;
  sparklineColor?: string;
  thresholdMode?: ThresholdMode;
  thresholdWarning?: number;
  thresholdCritical?: number;
  colorOk?: string;
  colorWarning?: string;
  colorCritical?: string;
  fixedMetricColor?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  showStatusBadge?: boolean;
}

/**
 * Item de dispositivo monitorado no card (ex: múltiplos servidores)
 */
export interface MonitoredDeviceItem {
  id: string;
  name: string;
  hostFilter?: string;
  enabled: boolean;
  metricOverride?: AnyDeviceMetricType;
  chartTypeOverride?: ChartType;
  customColor?: string;
}

/**
 * Grupo de configuração de múltiplos dispositivos no card
 */
export interface MonitoredDevicesConfigGroup {
  devices?: MonitoredDeviceItem[];
  groupInSingleCard?: boolean;
  consolidatedGroupMode?: ConsolidatedGroupMode;
}

/**
 * Grupo de opções da subcategoria Standard Options
 */
export interface StandardOptionsGroup {
  unit?: StandardUnitType;
  decimalsAuto?: boolean;
  customDecimals?: number;
  displayName?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  noValue?: string;
}

/**
 * Grupo de opções da categoria Estilização Visual (gavetas retráteis)
 */
export interface EstilizacaoVisualGroup {
  // 1. Estilização do Gráfico
  chartType?: ChartType;
  sparklineColor?: string;
  showProgressBar?: boolean;
  showSparkline?: boolean;
  thresholdMode?: ThresholdMode;
  thresholdWarning?: number;
  thresholdCritical?: number;
  colorOk?: string;
  colorWarning?: string;
  colorCritical?: string;
  fixedMetricColor?: string;

  // 2. Estilização do Painel
  backgroundColor?: string;
  cardBackgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  blockSize?: BlockSize;
  blockHeight?: number;
  columns?: LayoutColumns;
  showStatusBadge?: boolean;

  // 3. Fontes e Tipografia
  fontFamily?: FontFamily;
  fontSize?: FontSize;
}

export interface PanelOptions {
  // 1. Seleção de Dispositivo e Modo do Card
  deviceType: DeviceType;
  cardDisplayMode: CardDisplayMode;
  /** Limite de itens exibidos. Campo de texto no editor: vazio ou 0 = sem limite */
  maxDevices?: number | string;

  // 2. Seleção do que monitorar por Dispositivo
  // (legado: os seletores "O que Monitorar no ..." foram removidos do editor;
  //  mantidos opcionais apenas para ler dashboards salvos antigos)
  firewallMetric?: FirewallMetricType;
  vmMetric?: VmMetricType;
  proxyMetric?: ProxyMetricType;
  hostMetric?: HostMetricType;
  servidorMetric?: ServidorMetricType;
  accessPointMetric?: AccessPointMetricType;
  portaRedeMetric?: PortaRedeMetricType;
  overrideCardTitleWithPreset: boolean;

  // 2.1 Seleção de Múltiplas Métricas, Estilização Individual e Múltiplos Dispositivos
  selectedMetrics?: AnyDeviceMetricType[];
  metricStyles?: Record<string, MetricStyleOverride>;
  monitoredDevicesConfig?: MonitoredDevicesConfigGroup;

  // 3. Subcategoria Standard Options (agrupada no editor colapsável)
  standardOptions?: StandardOptionsGroup;

  // 4. Subcategorias de Estilização Visual (agrupadas em gavetas retráteis)
  estilizacaoVisual?: EstilizacaoVisualGroup;

  // Propriedades mantidas para retrocompatibilidade
  standardUnit?: StandardUnitType;
  decimalsAuto?: boolean;
  customDecimals?: number;
  standardDecimals?: 'auto' | '0' | '1' | '2' | '3' | '4';
  standardMin?: number;
  standardMax?: number;
  standardDisplayName?: string;
  standardPrefix?: string;
  standardSuffix?: string;
  standardNoValue?: string;

  // 4. Estilização Visual: Variações dos Gráficos, Cores, Tipografia e Layout
  chartType: ChartType;
  thresholdMode: ThresholdMode;
  thresholdWarning: number;
  thresholdCritical: number;
  colorOk?: string;
  colorWarning?: string;
  colorCritical?: string;
  fixedMetricColor?: string;

  // 4. Identificação do Painel / Dispositivo
  panelTitle: string;
  showPanelTitle: boolean;
  deviceName?: string;

  // 5. Estilização Visual
  backgroundColor?: string;
  cardBackgroundColor?: string;
  textColor?: string;
  borderColor?: string;

  // 6. Tipografia
  fontFamily: FontFamily;
  fontSize: FontSize;

  // 7. Layout e Comportamento dos Blocos
  blockSize?: BlockSize;
  blockHeight?: number;
  columns: LayoutColumns;
  showStatusBadge: boolean;
  showProgressBar: boolean;
  showSparkline: boolean;
  sparklineColor?: string;

  // Campos legados para retrocompatibilidade
  panelType?: MonitoringPanelType;
  diskMetricType?: DiskMetricSubType;
  cpuMetricType?: CpuMetricSubType;
  memoryMetricType?: MemoryMetricSubType;
  networkMetricType?: NetworkMetricSubType;
  statusMetricType?: StatusMetricSubType;
  systemMetricType?: SystemMetricSubType;
  vmwareMetricType?: VmwareMetricSubType;
  firewallMetricType?: FirewallMetricType;
  text?: string;
  showSeriesCount?: boolean;
  seriesCountSize?: 'sm' | 'md' | 'lg';
}

export type SimpleOptions = PanelOptions;

// Aliases em Português
export type OpcoesPainel = PanelOptions;
export type ItemBlocoMetrica = MetricBlockItem;
export type PontoDadoMetrica = MetricDataPoint;
export type NivelStatusMetrica = MetricStatusLevel;
export type CategoriaMetrica = MetricCategory;
export type TipoDispositivo = DeviceType;
export type ModoExibicaoCard = CardDisplayMode;
export type TipoGrafico = ChartType;
export type TamanhoBloco = BlockSize;
export type UnidadePadrao = StandardUnitType;
export type QualquerSubtipoMetrica = AnyDeviceMetricType;
