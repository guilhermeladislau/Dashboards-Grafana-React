import { AnyMetricSubType, PanelOptions } from '../types';
import {
  obterMetricaDispositivoAtiva,
  PRECONFIGURACOES_METRICAS,
} from './preconfiguracoesDispositivos';

export * from './preconfiguracoesDispositivos';

/**
 * Rótulos amigáveis em português para cada subtipo de métrica (novos e legados)
 */
export const ROTULOS_SUBTIPOS: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(PRECONFIGURACOES_METRICAS).map(([chave, cfg]) => [chave, cfg.rotulo])
  ),
  // Disco (legado)
  disk_usage_pct: 'Uso de Disco (%)',
  disk_free_pct: 'Espaço Livre em Disco (%)',
  disk_used_bytes: 'Espaço Usado em Disco',
  disk_free_bytes: 'Espaço Livre em Disco',
  disk_total_bytes: 'Capacidade Total do Disco',
  disk_read_iops: 'IOPS de Leitura',
  disk_write_latency: 'Latência de Escrita',
  // CPU (legado)
  cpu_usage_pct: 'Uso de CPU (%)',
  cpu_user_time: 'Tempo de Usuário CPU (%)',
  cpu_system_time: 'Tempo de Sistema CPU (%)',
  cpu_queue_length: 'Fila de Processador (Queue)',
  cpu_ready_pct: 'CPU Ready / Contenção (%)',
  cpu_cores: 'vCPUs / Núcleos Alocados',
  // Memória (legado)
  mem_usage_pct: 'Uso de Memória RAM (%)',
  mem_free_pct: 'Memória RAM Livre (%)',
  mem_used_bytes: 'Memória RAM Utilizada',
  mem_free_bytes: 'Memória RAM Livre',
  mem_total_bytes: 'Memória RAM Total',
  mem_swap_pct: 'Uso de Swap (%)',
  // Rede (legado)
  net_traffic_in: 'Tráfego de Entrada (Download)',
  net_traffic_out: 'Tráfego de Saída (Upload)',
  net_packets_sec: 'Pacotes por Segundo',
  net_errors_discards: 'Erros e Descartes de Rede',
  net_ping_latency: 'Latência ICMP (Ping)',
  net_packet_loss: 'Perda de Pacotes ICMP (%)',
  // Status (legado)
  status_icmp_ping: 'Status de Conectividade ICMP',
  status_zabbix_agent: 'Status do Zabbix Agent',
  status_health_state: 'Saúde Geral do Sistema',
  // Sistema (legado)
  sys_uptime: 'Tempo de Atividade (Uptime)',
  sys_hostname: 'Hostname do Servidor',
  sys_power_watts: 'Consumo de Energia (Watts)',
  sys_alarms_count: 'Incidentes e Alarmes Ativos',
  // VMware (legado)
  vm_power_state: 'Estado da VM (Power State)',
  vm_guest_count: 'Total de Guest VMs',
  vm_snapshots_count: 'Snapshots Ativos',
  vm_esxi_status: 'Status do Hypervisor ESXi',
  vm_vcpus: 'vCPUs Alocadas',
  vm_datastore_free_pct: 'Espaço Livre no Datastore (%)',
  // Firewall (legado)
  fw_active_sessions: 'Sessões Concorrentes Ativas',
  fw_wan_bandwidth: 'Tráfego de Banda WAN',
  fw_cpu_ram_corr: 'Recursos do Firewall (%)',
  fw_uptime: 'Uptime do Firewall FortiGate',
};

/**
 * Retorna o subtipo ativo de acordo com o dispositivo selecionado ou legado
 */
export function obterSubTipoAtivo(opcoes?: Partial<PanelOptions>): AnyMetricSubType | null {
  const metricaDispositivo = obterMetricaDispositivoAtiva(opcoes);
  if (metricaDispositivo) {
    return metricaDispositivo;
  }

  const tipoPainel = opcoes?.panelType || 'auto';
  switch (tipoPainel) {
    case 'disk':
      return opcoes?.diskMetricType || 'disk_usage_pct';
    case 'cpu':
      return opcoes?.cpuMetricType || 'cpu_usage_pct';
    case 'memory':
      return opcoes?.memoryMetricType || 'mem_usage_pct';
    case 'network':
      return opcoes?.networkMetricType || 'net_traffic_in';
    case 'status':
      return opcoes?.statusMetricType || 'status_icmp_ping';
    case 'system':
      return opcoes?.systemMetricType || 'sys_uptime';
    case 'vmware':
      return opcoes?.vmwareMetricType || 'vm_power_state';
    case 'firewall':
      return opcoes?.firewallMetricType || 'fw_active_sessions';
    case 'auto':
    default:
      return null;
  }
}

// Aliases para compatibilidade retroativa
export const SUBTYPE_LABELS = ROTULOS_SUBTIPOS;
export const getActiveSubType = obterSubTipoAtivo;
