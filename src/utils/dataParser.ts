import { FieldType, formattedValueToString, getFieldDisplayName, PanelData } from '@grafana/data';
import {
  AnyMetricSubType,
  MetricBlockItem,
  MetricCategory,
  MetricDataPoint,
  MetricStatusLevel,
  PanelOptions,
} from '../types';

/**
 * Formata segundos no formato legível de Uptime (ex.: 14d 6h 32m)
 */
export function formatUptime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return '0m 0s';
  }
  const s = Math.floor(seconds);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);

  if (d > 0) {
    return `${d}d ${h}h ${m}m`;
  }
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m}m ${s % 60}s`;
}

/**
 * Formata bytes brutos para B, KB, MB, GB, TB
 */
export function formatBytes(bytes: number): string {
  if (isNaN(bytes) || bytes <= 0) {
    return '0 B';
  }
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.max(0, Math.floor(Math.log(bytes) / Math.log(k)));
  const idx = Math.min(i, sizes.length - 1);
  return `${(bytes / Math.pow(k, idx)).toFixed(1)} ${sizes[idx]}`;
}

/**
 * Formata taxa de tráfego de rede (bps, Kbps, Mbps, Gbps)
 */
export function formatBandwidth(bps: number): string {
  if (isNaN(bps) || bps <= 0) {
    return '0 bps';
  }
  const k = 1000;
  const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'];
  const i = Math.max(0, Math.floor(Math.log(bps) / Math.log(k)));
  const idx = Math.min(i, sizes.length - 1);
  return `${(bps / Math.pow(k, idx)).toFixed(2)} ${sizes[idx]}`;
}

/**
 * Formata latência (converte segundos do Zabbix < 10 para ms caso necessário)
 */
export function formatLatencyMs(val: number): { ms: number; text: string } {
  if (isNaN(val) || val < 0) {
    return { ms: 0, text: '0.0 ms' };
  }
  // No Zabbix, icmppingsec costuma vir em segundos (ex: 0.014 = 14ms)
  const ms = val > 0 && val < 1 ? val * 1000 : val;
  return {
    ms,
    text: `${ms.toFixed(1)} ms`,
  };
}

/**
 * Rótulos amigáveis para cada subtipo de métrica
 */
export const SUBTYPE_LABELS: Record<AnyMetricSubType, string> = {
  // Disco
  disk_usage_pct: 'Uso de Disco (%)',
  disk_free_pct: 'Espaço Livre em Disco (%)',
  disk_used_bytes: 'Espaço Usado em Disco',
  disk_free_bytes: 'Espaço Livre em Disco',
  disk_total_bytes: 'Capacidade Total do Disco',
  disk_read_iops: 'IOPS de Leitura',
  disk_write_latency: 'Latência de Escrita',
  // CPU
  cpu_usage_pct: 'Uso de CPU (%)',
  cpu_user_time: 'Tempo de Usuário CPU (%)',
  cpu_system_time: 'Tempo de Sistema CPU (%)',
  cpu_queue_length: 'Fila de Processador (Queue)',
  cpu_ready_pct: 'CPU Ready / Contenção (%)',
  cpu_cores: 'vCPUs / Núcleos Alocados',
  // Memória
  mem_usage_pct: 'Uso de Memória RAM (%)',
  mem_free_pct: 'Memória RAM Livre (%)',
  mem_used_bytes: 'Memória RAM Utilizada',
  mem_free_bytes: 'Memória RAM Livre',
  mem_total_bytes: 'Memória RAM Total',
  mem_swap_pct: 'Uso de Swap (%)',
  // Rede
  net_traffic_in: 'Tráfego de Entrada (Download)',
  net_traffic_out: 'Tráfego de Saída (Upload)',
  net_packets_sec: 'Pacotes por Segundo',
  net_errors_discards: 'Erros e Descartes de Rede',
  net_ping_latency: 'Latência ICMP (Ping)',
  net_packet_loss: 'Perda de Pacotes ICMP (%)',
  // Status
  status_icmp_ping: 'Status de Conectividade ICMP',
  status_zabbix_agent: 'Status do Zabbix Agent',
  status_health_state: 'Saúde Geral do Sistema',
  // Sistema
  sys_uptime: 'Tempo de Atividade (Uptime)',
  sys_hostname: 'Hostname do Servidor',
  sys_power_watts: 'Consumo de Energia (Watts)',
  sys_alarms_count: 'Incidentes e Alarmes Ativos',
  // VMware
  vm_power_state: 'Estado da VM (Power State)',
  vm_guest_count: 'Total de Guest VMs',
  vm_snapshots_count: 'Snapshots Ativos',
  vm_esxi_status: 'Status do Hypervisor ESXi',
  vm_vcpus: 'vCPUs Alocadas',
  vm_datastore_free_pct: 'Espaço Livre no Datastore (%)',
  // Firewall
  fw_active_sessions: 'Sessões Concorrentes Ativas',
  fw_wan_bandwidth: 'Tráfego de Banda WAN',
  fw_cpu_ram_corr: 'Recursos do Firewall (%)',
  fw_uptime: 'Uptime do Firewall FortiGate',
};

/**
 * Retorna o subtipo ativo de acordo com a categoria selecionada em PanelOptions
 */
export function getActiveSubType(options?: Partial<PanelOptions>): AnyMetricSubType | null {
  const panelType = options?.panelType || 'auto';
  switch (panelType) {
    case 'disk':
      return options?.diskMetricType || 'disk_usage_pct';
    case 'cpu':
      return options?.cpuMetricType || 'cpu_usage_pct';
    case 'memory':
      return options?.memoryMetricType || 'mem_usage_pct';
    case 'network':
      return options?.networkMetricType || 'net_traffic_in';
    case 'status':
      return options?.statusMetricType || 'status_icmp_ping';
    case 'system':
      return options?.systemMetricType || 'sys_uptime';
    case 'vmware':
      return options?.vmwareMetricType || 'vm_power_state';
    case 'firewall':
      return options?.firewallMetricType || 'fw_active_sessions';
    case 'auto':
    default:
      return null;
  }
}

/**
 * Avalia um percentual de USO (quanto maior, mais crítico)
 */
function evaluateUsagePct(
  val: number,
  warnThreshold: number,
  critThreshold: number,
  contextLabel = 'Operação Saudável'
): {
  percentage: number;
  displayValue: string;
  statusLevel: MetricStatusLevel;
  statusBadge: string;
  subText: string;
  statusColor: string;
} {
  const percentage = Math.max(0, Math.min(100, val));
  const displayValue = `${percentage.toFixed(1)}%`;

  if (percentage < warnThreshold) {
    return {
      percentage,
      displayValue,
      statusLevel: 'ok',
      statusBadge: 'NORMAL',
      subText: `${contextLabel} (< ${warnThreshold}%)`,
      statusColor: '#22c55e',
    };
  }
  if (percentage < critThreshold) {
    return {
      percentage,
      displayValue,
      statusLevel: 'warning',
      statusBadge: 'ATENÇÃO',
      subText: `Carga Elevada (${warnThreshold}-${critThreshold}%)`,
      statusColor: '#f59e0b',
    };
  }
  return {
    percentage,
    displayValue,
    statusLevel: 'critical',
    statusBadge: 'CRÍTICO',
    subText: `Sobrecarga Crítica (> ${critThreshold}%)`,
    statusColor: '#ef4444',
  };
}

/**
 * Avalia um percentual LIVRE (quanto menor o espaço/memória livre, mais crítico)
 */
function evaluateFreePct(
  val: number,
  warnUsageThreshold: number,
  critUsageThreshold: number,
  contextLabel = 'Espaço Livre Disponível'
): {
  percentage: number;
  displayValue: string;
  statusLevel: MetricStatusLevel;
  statusBadge: string;
  subText: string;
  statusColor: string;
} {
  const freePct = Math.max(0, Math.min(100, val));
  const usedEquivalent = 100 - freePct;
  const displayValue = `${freePct.toFixed(1)}%`;

  if (usedEquivalent >= critUsageThreshold) {
    return {
      percentage: freePct,
      displayValue,
      statusLevel: 'critical',
      statusBadge: 'POUCO ESPAÇO',
      subText: `Reserva Crítica (< ${(100 - critUsageThreshold).toFixed(0)}% livre)`,
      statusColor: '#ef4444',
    };
  }
  if (usedEquivalent >= warnUsageThreshold) {
    return {
      percentage: freePct,
      displayValue,
      statusLevel: 'warning',
      statusBadge: 'ATENÇÃO',
      subText: `Espaço Reduzido (< ${(100 - warnUsageThreshold).toFixed(0)}% livre)`,
      statusColor: '#f59e0b',
    };
  }
  return {
    percentage: freePct,
    displayValue,
    statusLevel: 'ok',
    statusBadge: 'DISPONÍVEL',
    subText: contextLabel,
    statusColor: '#22c55e',
  };
}

/**
 * Extrai e estrutura os dados das queries do Zabbix, aplicando o modo explícito selecionado ou detecção inteligente.
 */
export function extractMetricsFromData(
  data: PanelData,
  options?: Partial<PanelOptions>
): MetricBlockItem[] {
  if (!data || !data.series || data.series.length === 0) {
    return [];
  }

  const warnThreshold = options?.thresholdWarning ?? 70;
  const critThreshold = options?.thresholdCritical ?? 85;
  const activeSubType = getActiveSubType(options);

  const items: MetricBlockItem[] = [];

  for (const series of data.series) {
    const timeField = series.fields.find((f) => f.type === FieldType.time);
    const valueFields = series.fields.filter((f) => f.type === FieldType.number || f.type === FieldType.string);

    for (const field of valueFields) {
      const rawFieldName = getFieldDisplayName(field, series, data.series) || field.name;
      const lowerName = rawFieldName.toLowerCase();
      const unit = field.config.unit || '';

      const points: MetricDataPoint[] = [];
      let latestValue: number | string | null = null;

      const len = field.values.length;
      for (let i = 0; i < len; i++) {
        const val = field.values[i];
        const time = timeField ? timeField.values[i] : undefined;

        if (val !== undefined && val !== null && val !== '') {
          latestValue = val;
        }

        points.push({
          time,
          value: val ?? null,
        });
      }

      let category: MetricCategory = 'generic';
      let statusLevel: MetricStatusLevel = 'info';
      let statusBadge: string | undefined = undefined;
      let subText: string | undefined = undefined;
      let statusColor = '#3b82f6';
      let percentage: number | undefined = undefined;
      let displayValue = '-';
      let icon: string | undefined = undefined;

      const numVal = typeof latestValue === 'number' ? latestValue : Number(latestValue);
      const isNum = !isNaN(numVal) && latestValue !== null && latestValue !== '';

      // =========================================================================
      // MODO 1: TIPO DE PAINEL EXPLICITAMENTE SELECIONADO PELO USUÁRIO NO EDITOR
      // =========================================================================
      if (activeSubType) {
        switch (activeSubType) {
          // --- DISCO / ARMAZENAMENTO ---
          case 'disk_usage_pct': {
            category = 'disk';
            icon = '💿';
            if (isNum) {
              const res = evaluateUsagePct(numVal, warnThreshold, critThreshold, 'Uso de Disco Saudável');
              percentage = res.percentage;
              displayValue = res.displayValue;
              statusLevel = res.statusLevel;
              statusBadge = res.statusBadge;
              subText = res.subText;
              statusColor = res.statusColor;
            }
            break;
          }
          case 'disk_free_pct':
          case 'vm_datastore_free_pct': {
            category = 'disk';
            icon = '💾';
            if (isNum) {
              const res = evaluateFreePct(
                numVal,
                warnThreshold,
                critThreshold,
                activeSubType === 'vm_datastore_free_pct' ? 'Espaço Livre no Datastore' : 'Espaço Livre em Disco'
              );
              percentage = res.percentage;
              displayValue = res.displayValue;
              statusLevel = res.statusLevel;
              statusBadge = res.statusBadge;
              subText = res.subText;
              statusColor = res.statusColor;
            }
            break;
          }
          case 'disk_used_bytes': {
            category = 'bytes';
            icon = '💿';
            statusLevel = 'info';
            statusBadge = 'EM USO';
            subText = 'Espaço Ocupado em Volume';
            statusColor = '#818cf8';
            displayValue = isNum ? formatBytes(numVal) : String(latestValue ?? '-');
            break;
          }
          case 'disk_free_bytes': {
            category = 'bytes';
            icon = '💿';
            statusLevel = 'ok';
            statusBadge = 'LIVRE';
            subText = 'Volume Disponível para Gravação';
            statusColor = '#22c55e';
            displayValue = isNum ? formatBytes(numVal) : String(latestValue ?? '-');
            break;
          }
          case 'disk_total_bytes': {
            category = 'bytes';
            icon = '💿';
            statusLevel = 'info';
            statusBadge = 'CAPACIDADE';
            subText = 'Tamanho Total do Volume';
            statusColor = '#38bdf8';
            displayValue = isNum ? formatBytes(numVal) : String(latestValue ?? '-');
            break;
          }
          case 'disk_read_iops': {
            category = 'counter';
            icon = '⚡';
            statusLevel = 'ok';
            statusBadge = 'IOPS';
            subText = 'Operações de Leitura / seg';
            statusColor = '#38bdf8';
            displayValue = isNum ? `${numVal.toLocaleString(undefined, { maximumFractionDigits: 1 })} IOPS` : '-';
            break;
          }
          case 'disk_write_latency': {
            category = 'latency';
            icon = '⏱️';
            if (isNum) {
              const { ms, text } = formatLatencyMs(numVal);
              displayValue = text;
              if (ms < 20) {
                statusLevel = 'ok';
                statusBadge = 'RÁPIDO';
                subText = 'Latência de Escrita Ideal (< 20ms)';
                statusColor = '#22c55e';
              } else if (ms < 50) {
                statusLevel = 'warning';
                statusBadge = 'MODERADO';
                subText = 'Latência de Escrita Elevada';
                statusColor = '#f59e0b';
              } else {
                statusLevel = 'critical';
                statusBadge = 'LENTO';
                subText = 'Gargalo de Disco (> 50ms)';
                statusColor = '#ef4444';
              }
            }
            break;
          }

          // --- CPU / PROCESSADOR ---
          case 'cpu_usage_pct':
          case 'cpu_user_time':
          case 'cpu_system_time':
          case 'fw_cpu_ram_corr': {
            category = 'percentage';
            icon = '📈';
            if (isNum) {
              const labelMap: Record<string, string> = {
                cpu_usage_pct: 'Carga de Processador Normal',
                cpu_user_time: 'Processamento de Usuário',
                cpu_system_time: 'Processamento de Kernel/Sistema',
                fw_cpu_ram_corr: 'Recursos Dentro do Limiar',
              };
              const res = evaluateUsagePct(numVal, warnThreshold, critThreshold, labelMap[activeSubType]);
              percentage = res.percentage;
              displayValue = res.displayValue;
              statusLevel = res.statusLevel;
              statusBadge = res.statusBadge;
              subText = res.subText;
              statusColor = res.statusColor;
            }
            break;
          }
          case 'cpu_ready_pct': {
            category = 'percentage';
            icon = '⚡';
            if (isNum) {
              percentage = Math.max(0, Math.min(100, numVal));
              displayValue = `${numVal.toFixed(2)}%`;
              if (numVal < 5) {
                statusLevel = 'ok';
                statusBadge = 'NORMAL';
                subText = 'Sem Contenção de CPU (< 5%)';
                statusColor = '#22c55e';
              } else if (numVal < 10) {
                statusLevel = 'warning';
                statusBadge = 'CONTENÇÃO';
                subText = 'Espera de Agendamento (5-10%)';
                statusColor = '#f59e0b';
              } else {
                statusLevel = 'critical';
                statusBadge = 'CRÍTICO';
                subText = 'Alta Contenção de CPU (> 10%)';
                statusColor = '#ef4444';
              }
            }
            break;
          }
          case 'cpu_queue_length': {
            category = 'counter';
            icon = '📈';
            if (isNum) {
              displayValue = numVal.toFixed(1);
              if (numVal <= 2) {
                statusLevel = 'ok';
                statusBadge = 'FILA NORMAL';
                subText = 'Sem Gargalo de Threads';
                statusColor = '#22c55e';
              } else if (numVal <= 5) {
                statusLevel = 'warning';
                statusBadge = 'ATENÇÃO';
                subText = 'Fila de Processamento Moderada';
                statusColor = '#f59e0b';
              } else {
                statusLevel = 'critical';
                statusBadge = 'FILA ALTA';
                subText = 'Processador Sobrecarregado';
                statusColor = '#ef4444';
              }
            }
            break;
          }
          case 'cpu_cores':
          case 'vm_vcpus': {
            category = 'counter';
            icon = '⚙️';
            statusLevel = 'info';
            statusBadge = 'ALOCADO';
            subText = 'Processadores Virtuais / Núcleos';
            statusColor = '#818cf8';
            displayValue = isNum ? `${Math.round(numVal)} vCPUs` : String(latestValue ?? '-');
            break;
          }

          // --- MEMÓRIA RAM ---
          case 'mem_usage_pct':
          case 'mem_swap_pct': {
            category = 'percentage';
            icon = '🧠';
            if (isNum) {
              const res = evaluateUsagePct(
                numVal,
                warnThreshold,
                critThreshold,
                activeSubType === 'mem_swap_pct' ? 'Uso de Swap Controlado' : 'Alocação de RAM Saudável'
              );
              percentage = res.percentage;
              displayValue = res.displayValue;
              statusLevel = res.statusLevel;
              statusBadge = res.statusBadge;
              subText = res.subText;
              statusColor = res.statusColor;
            }
            break;
          }
          case 'mem_free_pct': {
            category = 'percentage';
            icon = '🧠';
            if (isNum) {
              const res = evaluateFreePct(numVal, warnThreshold, critThreshold, 'Memória RAM Livre Disponível');
              percentage = res.percentage;
              displayValue = res.displayValue;
              statusLevel = res.statusLevel;
              statusBadge = res.statusBadge;
              subText = res.subText;
              statusColor = res.statusColor;
            }
            break;
          }
          case 'mem_used_bytes': {
            category = 'bytes';
            icon = '🧠';
            statusLevel = 'info';
            statusBadge = 'EM USO';
            subText = 'Memória RAM Alocada';
            statusColor = '#818cf8';
            displayValue = isNum ? formatBytes(numVal) : String(latestValue ?? '-');
            break;
          }
          case 'mem_free_bytes': {
            category = 'bytes';
            icon = '🧠';
            statusLevel = 'ok';
            statusBadge = 'LIVRE';
            subText = 'Memória RAM Disponível';
            statusColor = '#22c55e';
            displayValue = isNum ? formatBytes(numVal) : String(latestValue ?? '-');
            break;
          }
          case 'mem_total_bytes': {
            category = 'bytes';
            icon = '🧠';
            statusLevel = 'info';
            statusBadge = 'TOTAL';
            subText = 'Memória Física Instalada';
            statusColor = '#38bdf8';
            displayValue = isNum ? formatBytes(numVal) : String(latestValue ?? '-');
            break;
          }

          // --- REDE E TRÁFEGO ---
          case 'net_traffic_in':
          case 'net_traffic_out':
          case 'fw_wan_bandwidth': {
            category = 'traffic';
            icon = '⚡';
            statusLevel = 'ok';
            statusBadge =
              activeSubType === 'net_traffic_in'
                ? 'DOWNLOAD'
                : activeSubType === 'net_traffic_out'
                ? 'UPLOAD'
                : 'WAN';
            subText = 'Taxa de Transferência de Rede';
            statusColor = activeSubType === 'net_traffic_out' ? '#a855f7' : '#38bdf8';
            displayValue = isNum ? formatBandwidth(numVal) : String(latestValue ?? '-');
            break;
          }
          case 'net_packets_sec': {
            category = 'traffic';
            icon = '📦';
            statusLevel = 'ok';
            statusBadge = 'PACOTES/S';
            subText = 'Fluxo de Pacotes na Interface';
            statusColor = '#6366f1';
            displayValue = isNum ? `${Math.round(numVal).toLocaleString()} pps` : '-';
            break;
          }
          case 'net_errors_discards': {
            category = 'counter';
            icon = '⚠️';
            if (isNum) {
              displayValue = Math.round(numVal).toLocaleString();
              if (numVal === 0) {
                statusLevel = 'ok';
                statusBadge = 'ÍNTEGRO';
                subText = 'Zero Erros ou Descartes';
                statusColor = '#22c55e';
              } else {
                statusLevel = 'warning';
                statusBadge = 'ALERTA';
                subText = 'Descartes/Erros Detectados na Interface';
                statusColor = '#f59e0b';
              }
            }
            break;
          }
          case 'net_ping_latency': {
            category = 'latency';
            icon = '📶';
            if (isNum) {
              const { ms, text } = formatLatencyMs(numVal);
              displayValue = text;
              if (ms < 50) {
                statusLevel = 'ok';
                statusBadge = 'ESTÁVEL';
                subText = 'Tempo de Resposta Ideal (< 50ms)';
                statusColor = '#22c55e';
              } else if (ms < 150) {
                statusLevel = 'warning';
                statusBadge = 'ALTA';
                subText = 'Latência Moderada (50-150ms)';
                statusColor = '#f59e0b';
              } else {
                statusLevel = 'critical';
                statusBadge = 'CRÍTICO';
                subText = 'Alta Latência ICMP (> 150ms)';
                statusColor = '#ef4444';
              }
            }
            break;
          }
          case 'net_packet_loss': {
            category = 'percentage';
            icon = '📡';
            if (isNum) {
              percentage = Math.max(0, Math.min(100, numVal));
              displayValue = `${percentage.toFixed(1)}%`;
              if (percentage === 0) {
                statusLevel = 'ok';
                statusBadge = '0% PERDA';
                subText = 'Conexão Limpa Sem Perda de Pacotes';
                statusColor = '#22c55e';
              } else if (percentage < 10) {
                statusLevel = 'warning';
                statusBadge = 'INSTÁVEL';
                subText = 'Perda Parcial de Pacotes ICMP';
                statusColor = '#f59e0b';
              } else {
                statusLevel = 'critical';
                statusBadge = 'DEGRADADO';
                subText = 'Perda Severa de Pacotes (> 10%)';
                statusColor = '#ef4444';
              }
            }
            break;
          }

          // --- STATUS / CONECTIVIDADE ---
          case 'status_icmp_ping':
          case 'status_zabbix_agent':
          case 'vm_power_state': {
            category = 'status';
            icon =
              activeSubType === 'status_zabbix_agent'
                ? '🛡️'
                : activeSubType === 'vm_power_state'
                ? '📦'
                : '🌐';
            if (isNum) {
              if (numVal >= 1) {
                statusLevel = 'ok';
                statusBadge = activeSubType === 'vm_power_state' ? 'POWERED ON' : 'ONLINE';
                subText =
                  activeSubType === 'status_zabbix_agent'
                    ? 'Agente Zabbix Comunicando'
                    : activeSubType === 'vm_power_state'
                    ? 'Máquina Virtual em Execução'
                    : 'Host Respondendo (100%)';
                statusColor = '#22c55e';
                displayValue = activeSubType === 'vm_power_state' ? 'LIGADA' : 'ONLINE';
              } else {
                statusLevel = 'offline';
                statusBadge = activeSubType === 'vm_power_state' ? 'POWERED OFF' : 'DOWN';
                subText =
                  activeSubType === 'status_zabbix_agent'
                    ? 'Agente Sem Comunicação'
                    : activeSubType === 'vm_power_state'
                    ? 'Máquina Virtual Desligada'
                    : 'Sem Resposta ICMP';
                statusColor = '#ef4444';
                displayValue = activeSubType === 'vm_power_state' ? 'DESLIGADA' : 'OFFLINE';
              }
            } else {
              displayValue = String(latestValue ?? '-');
            }
            break;
          }
          case 'status_health_state':
          case 'vm_esxi_status': {
            category = 'status';
            icon = '🛡️';
            if (isNum) {
              // No VMware Zabbix: 0 = green/ok ou 1 = ok dependendo do template
              if (numVal === 0 || numVal === 1) {
                statusLevel = 'ok';
                statusBadge = 'SAUDÁVEL';
                subText = 'Status Geral Sem Alertas Críticos';
                statusColor = '#22c55e';
                displayValue = 'SAUDÁVEL';
              } else if (numVal === 2) {
                statusLevel = 'warning';
                statusBadge = 'ATENÇÃO';
                subText = 'Estado de Alerta Moderado (Yellow)';
                statusColor = '#f59e0b';
                displayValue = 'ALERTA';
              } else {
                statusLevel = 'critical';
                statusBadge = 'CRÍTICO';
                subText = 'Alarme Crítico no Ambiente (Red)';
                statusColor = '#ef4444';
                displayValue = 'CRÍTICO';
              }
            } else {
              displayValue = String(latestValue ?? '-');
              statusLevel = 'ok';
              statusBadge = 'STATUS';
              statusColor = '#22c55e';
            }
            break;
          }

          // --- SISTEMA / DISPONIBILIDADE / VMWARE / FIREWALL ---
          case 'sys_uptime':
          case 'fw_uptime': {
            category = 'uptime';
            icon = '⏱️';
            statusLevel = 'ok';
            statusBadge = 'ATIVO';
            subText =
              activeSubType === 'fw_uptime'
                ? 'Tempo de Atividade do FortiGate'
                : 'Tempo Contínuo de Atividade';
            statusColor = '#22c55e';
            displayValue = isNum ? formatUptime(numVal) : String(latestValue ?? '-');
            break;
          }
          case 'sys_hostname': {
            category = 'generic';
            icon = '🏷️';
            statusLevel = 'info';
            statusBadge = 'HOST';
            subText = 'Identificação do Equipamento';
            statusColor = '#818cf8';
            displayValue = String(latestValue ?? '-');
            break;
          }
          case 'sys_power_watts': {
            category = 'counter';
            icon = '⚡';
            statusLevel = 'ok';
            statusBadge = 'ENERGIA';
            subText = 'Consumo Elétrico Atual';
            statusColor = '#f59e0b';
            displayValue = isNum ? `${Math.round(numVal)} W` : String(latestValue ?? '-');
            break;
          }
          case 'sys_alarms_count':
          case 'vm_snapshots_count': {
            category = 'counter';
            icon = activeSubType === 'vm_snapshots_count' ? '📸' : '🚨';
            if (isNum) {
              const count = Math.round(numVal);
              displayValue = String(count);
              if (count === 0) {
                statusLevel = 'ok';
                statusBadge = 'LIMPO';
                subText =
                  activeSubType === 'vm_snapshots_count'
                    ? 'Nenhum Snapshot Ativo'
                    : 'Sem Incidentes Ativos';
                statusColor = '#22c55e';
              } else {
                statusLevel = 'warning';
                statusBadge = activeSubType === 'vm_snapshots_count' ? 'SNAPSHOTS' : 'INCIDENTES';
                subText =
                  activeSubType === 'vm_snapshots_count'
                    ? `${count} Snapshot(s) Retido(s)`
                    : `${count} Alarme(s) Ativo(s)`;
                statusColor = '#f59e0b';
              }
            }
            break;
          }
          case 'vm_guest_count': {
            category = 'counter';
            icon = '📦';
            statusLevel = 'info';
            statusBadge = 'VMs';
            subText = 'Total de Máquinas Virtuais no Ambiente';
            statusColor = '#38bdf8';
            displayValue = isNum ? `${Math.round(numVal)} VMs` : String(latestValue ?? '-');
            break;
          }
          case 'fw_active_sessions': {
            category = 'counter';
            icon = '👥';
            statusLevel = 'ok';
            statusBadge = 'SESSÕES';
            subText = 'Conexões Concorrentes no Firewall';
            statusColor = '#a855f7';
            displayValue = isNum ? Math.round(numVal).toLocaleString() : String(latestValue ?? '-');
            break;
          }
        }
      }
      // =========================================================================
      // MODO 2: DETECÇÃO AUTOMÁTICA INTELIGENTE (`panelType === 'auto'`)
      // =========================================================================
      else {
        // 1. STATUS BOOLEANO / CONECTIVIDADE (ICMP Ping, Zabbix Agent, Power State)
        if (
          (lowerName.includes('ping') ||
            lowerName.includes('agent') ||
            lowerName.includes('power state') ||
            lowerName.includes('status')) &&
          isNum &&
          (numVal === 0 || numVal === 1)
        ) {
          category = 'status';
          if (numVal >= 1) {
            statusLevel = 'ok';
            statusBadge = 'ONLINE';
            subText = 'Host Respondendo (100%)';
            statusColor = '#22c55e';
            displayValue = 'ONLINE';
          } else {
            statusLevel = 'offline';
            statusBadge = 'DOWN';
            subText = 'Sem Resposta ICMP';
            statusColor = '#ef4444';
            displayValue = 'OFFLINE';
          }
        }
        // 2. TEMPO DE ATIVIDADE (Uptime)
        else if (lowerName.includes('uptime') && isNum) {
          category = 'uptime';
          statusLevel = 'ok';
          statusBadge = 'ATIVO';
          subText = 'Tempo de Atividade';
          statusColor = '#22c55e';
          displayValue = formatUptime(numVal);
        }
        // 3. ESPAÇO LIVRE PERCENTUAL (Lógica invertida quando o nome tem "free" ou "livre")
        else if (
          isNum &&
          (lowerName.includes('free') || lowerName.includes('livre')) &&
          (unit === '%' || lowerName.includes('%') || numVal <= 100) &&
          numVal >= 0 &&
          numVal <= 100
        ) {
          category = 'disk';
          const res = evaluateFreePct(numVal, warnThreshold, critThreshold);
          percentage = res.percentage;
          displayValue = res.displayValue;
          statusLevel = res.statusLevel;
          statusBadge = res.statusBadge;
          subText = res.subText;
          statusColor = res.statusColor;
        }
        // 4. RECURSOS PERCENTUAIS DE USO (CPU, Memória %, Discos)
        else if (
          isNum &&
          (unit === '%' ||
            lowerName.includes('%') ||
            lowerName.includes('utilization') ||
            lowerName.includes('usage') ||
            lowerName.includes('disco') ||
            lowerName.includes('datastore')) &&
          numVal <= 100 &&
          numVal >= 0
        ) {
          category = 'percentage';
          const res = evaluateUsagePct(numVal, warnThreshold, critThreshold);
          percentage = res.percentage;
          displayValue = res.displayValue;
          statusLevel = res.statusLevel;
          statusBadge = res.statusBadge;
          subText = res.subText;
          statusColor = res.statusColor;
        }
        // 5. MEMÓRIA OU ARMAZENAMENTO EM BYTES BRUTOS (> 100)
        else if (
          isNum &&
          numVal > 100 &&
          (lowerName.includes('memory') ||
            lowerName.includes('ram') ||
            lowerName.includes('disk') ||
            lowerName.includes('disco') ||
            lowerName.includes('space') ||
            lowerName.includes('bytes'))
        ) {
          category = 'bytes';
          statusLevel = 'ok';
          statusBadge = lowerName.includes('free') || lowerName.includes('livre') ? 'LIVRE' : 'VOLUME';
          subText = 'Capacidade / Armazenamento';
          statusColor = '#818cf8';
          displayValue = formatBytes(numVal);
        }
        // 6. VALORES GENÉRICOS (Tráfego, Sessões, Hostname, etc.)
        else {
          category = 'generic';
          if (field.display && latestValue !== null) {
            displayValue = formattedValueToString(field.display(latestValue));
          } else if (isNum) {
            displayValue = numVal.toLocaleString(undefined, { maximumFractionDigits: 2 });
            if (unit) {
              displayValue += ` ${unit}`;
            }
          } else if (latestValue !== null && latestValue !== undefined) {
            displayValue = String(latestValue);
          }
          statusColor = field.config.color?.fixedColor || '#6366f1';
        }
      }

      // Define o título do card (usa o nome padrão do tipo selecionado se ativado, ou o nome vindo do Zabbix)
      const finalTitle =
        activeSubType && options?.overrideCardTitleWithPreset
          ? SUBTYPE_LABELS[activeSubType]
          : rawFieldName;

      items.push({
        id: `${series.refId || ''}_${field.name}_${series.name || ''}`,
        title: finalTitle,
        currentValue: latestValue,
        displayValue,
        unit,
        points,
        category,
        statusLevel,
        statusBadge,
        subText,
        percentage,
        statusColor,
        icon,
      });
    }
  }

  return items;
}
