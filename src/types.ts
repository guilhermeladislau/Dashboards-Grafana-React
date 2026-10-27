export type FontSize = 'sm' | 'md' | 'lg' | 'xl';
export type FontFamily = 'default' | 'Inter' | 'Roboto' | 'Open Sans' | 'Montserrat' | 'monospace';
export type LayoutColumns = 'auto' | '1' | '2' | '3' | '4';

export type MetricCategory = 'status' | 'uptime' | 'percentage' | 'disk' | 'bytes' | 'traffic' | 'latency' | 'counter' | 'generic';
export type MetricStatusLevel = 'ok' | 'warning' | 'critical' | 'offline' | 'info';

/**
 * Categorias principais de painel selecionáveis nas opções do bloco
 */
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

/**
 * Subtipos de métricas por categoria de monitoramento
 */
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

export type VmwareMetricSubType =
  | 'vm_power_state'
  | 'vm_guest_count'
  | 'vm_snapshots_count'
  | 'vm_esxi_status'
  | 'vm_vcpus'
  | 'vm_datastore_free_pct';

export type FirewallMetricSubType =
  | 'fw_active_sessions'
  | 'fw_wan_bandwidth'
  | 'fw_cpu_ram_corr'
  | 'fw_uptime';

export type AnyMetricSubType =
  | DiskMetricSubType
  | CpuMetricSubType
  | MemoryMetricSubType
  | NetworkMetricSubType
  | StatusMetricSubType
  | SystemMetricSubType
  | VmwareMetricSubType
  | FirewallMetricSubType;

export interface MetricDataPoint {
  time?: number;
  value: number | string | null;
}

export interface MetricBlockItem {
  id: string;
  title: string;
  currentValue: number | string | null;
  displayValue: string;
  unit: string;
  points: MetricDataPoint[];
  color?: string;
  category: MetricCategory;
  statusLevel: MetricStatusLevel;
  statusBadge?: string;
  subText?: string;
  percentage?: number;
  statusColor?: string;
  icon?: string;
}

export interface PanelOptions {
  // Tipo de Painel & Métrica (Seleção em Cascata)
  panelType: MonitoringPanelType;
  diskMetricType: DiskMetricSubType;
  cpuMetricType: CpuMetricSubType;
  memoryMetricType: MemoryMetricSubType;
  networkMetricType: NetworkMetricSubType;
  statusMetricType: StatusMetricSubType;
  systemMetricType: SystemMetricSubType;
  vmwareMetricType: VmwareMetricSubType;
  firewallMetricType: FirewallMetricSubType;
  overrideCardTitleWithPreset: boolean;

  // Identificação
  panelTitle: string;
  showPanelTitle: boolean;

  // Estilização Visual
  backgroundColor?: string;
  cardBackgroundColor?: string;
  textColor?: string;
  borderColor?: string;

  // Tipografia
  fontFamily: FontFamily;
  fontSize: FontSize;

  // Layout dos Blocos
  columns: LayoutColumns;
  showSparkline: boolean;
  sparklineColor?: string;

  // Comportamento & Limiares (Thresholds)
  thresholdWarning: number;
  thresholdCritical: number;
  showStatusBadge: boolean;
  showProgressBar: boolean;

  // Campos de compatibilidade legado / testes
  text?: string;
  showSeriesCount?: boolean;
  seriesCountSize?: 'sm' | 'md' | 'lg';
}

export type SimpleOptions = PanelOptions;
