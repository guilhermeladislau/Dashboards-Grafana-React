import { DataFrame } from '@grafana/data';
import {
  AnyDeviceMetricType,
  ChartType,
  DeviceType,
  MetricCategory,
  PanelOptions,
  StandardUnitType,
} from '../types';
import { identificarSeries } from './identificacaoSeries';

export interface PreconfiguracaoMetricaDispositivo {
  rotulo: string;
  icone: string;
  unidadePadrao: Exclude<StandardUnitType, 'auto'>;
  graficoPadrao: Exclude<ChartType, 'auto'>;
  modoLimiar: 'normal' | 'invertido' | 'fixo';
  limiarAtencao: number;
  limiarCritico: number;
  minimo: number;
  maximo: number;
  decimais: number;
  subTextoPadrao: string;
  categoria: MetricCategory;
}

export interface MetadadosDispositivo {
  id: DeviceType;
  nome: string;
  icone: string;
  corDestaque: string;
  descricao: string;
}

export const METADADOS_DISPOSITIVOS: Record<DeviceType, MetadadosDispositivo> = {
  auto: {
    id: 'auto',
    nome: 'Dispositivo Automático',
    icone: '🤖',
    corDestaque: '#6366f1',
    descricao: 'Detecção inteligente baseada nas queries do Zabbix',
  },
  firewall: {
    id: 'firewall',
    nome: 'Firewall & Segurança',
    icone: '🛡️',
    corDestaque: '#ef4444',
    descricao: 'Monitoramento de links WAN, sessões, IPS e recursos do Firewall',
  },
  vm: {
    id: 'vm',
    nome: 'Máquina Virtual (VM)',
    icone: '📦',
    corDestaque: '#8b5cf6',
    descricao: 'Monitoramento de recursos virtuais, CPU Ready, IOPS e Snapshots',
  },
  proxy: {
    id: 'proxy',
    nome: 'Servidor Proxy',
    icone: '🌐',
    corDestaque: '#06b6d4',
    descricao: 'Monitoramento de requisições HTTP, taxa de cache, latência e conexões',
  },
  host: {
    id: 'host',
    nome: 'Host / Hipervisor',
    icone: '🖧',
    corDestaque: '#3b82f6',
    descricao: 'Monitoramento físico de cluster, ESXi/Proxmox, datastores e hardware',
  },
  servidor: {
    id: 'servidor',
    nome: 'Servidor (Windows / Linux)',
    icone: '🖥️',
    corDestaque: '#10b981',
    descricao: 'Monitoramento de SO, CPU, RAM, discos, serviços e disponibilidade',
  },
  access_point: {
    id: 'access_point',
    nome: 'Access Point (Wi-Fi)',
    icone: '📡',
    corDestaque: '#f59e0b',
    descricao: 'Monitoramento de clientes sem fio, potência de sinal, interferência e tráfego',
  },
  porta_rede: {
    id: 'porta_rede',
    nome: 'Porta de Rede / Switch',
    icone: '🔌',
    corDestaque: '#ec4899',
    descricao: 'Monitoramento de link, tráfego RX/TX, erros CRC, pacotes e PoE',
  },
};

export const PRECONFIGURACOES_METRICAS: Record<string, PreconfiguracaoMetricaDispositivo> = {
  // ==========================================
  // 1. FIREWALL
  // ==========================================
  fw_status: {
    rotulo: 'Status do Firewall',
    icone: '🛡️',
    unidadePadrao: 'status',
    graficoPadrao: 'nenhum',
    modoLimiar: 'normal',
    limiarAtencao: 1,
    limiarCritico: 0,
    minimo: 0,
    maximo: 1,
    decimais: 0,
    subTextoPadrao: 'Disponibilidade do Appliance Firewall',
    categoria: 'status',
  },
  fw_cpu: {
    rotulo: 'Uso de CPU do Firewall',
    icone: '📈',
    unidadePadrao: 'percent',
    graficoPadrao: 'circulo',
    modoLimiar: 'normal',
    limiarAtencao: 70,
    limiarCritico: 85,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Processamento de Pacotes e Inspeção',
    categoria: 'percentage',
  },
  fw_memoria: {
    rotulo: 'Uso de Memória do Firewall',
    icone: '🧠',
    unidadePadrao: 'percent',
    graficoPadrao: 'barra',
    modoLimiar: 'normal',
    limiarAtencao: 75,
    limiarCritico: 90,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Alocação de Memória do Sistema',
    categoria: 'percentage',
  },
  fw_sessoes: {
    rotulo: 'Sessões Concorrentes Ativas',
    icone: '👥',
    unidadePadrao: 'numero',
    graficoPadrao: 'area',
    modoLimiar: 'fixo',
    limiarAtencao: 50000,
    limiarCritico: 100000,
    minimo: 0,
    maximo: 100000,
    decimais: 0,
    subTextoPadrao: 'Tabela de Estados / Conexões no Firewall',
    categoria: 'counter',
  },
  fw_trafego_wan_in: {
    rotulo: 'Tráfego WAN Download (Entrada)',
    icone: '⬇️',
    unidadePadrao: 'bps',
    graficoPadrao: 'area',
    modoLimiar: 'fixo',
    limiarAtencao: 80,
    limiarCritico: 95,
    minimo: 0,
    maximo: 1000000000,
    decimais: 2,
    subTextoPadrao: 'Banda de Entrada no Link WAN',
    categoria: 'traffic',
  },
  fw_trafego_wan_out: {
    rotulo: 'Tráfego WAN Upload (Saída)',
    icone: '⬆️',
    unidadePadrao: 'bps',
    graficoPadrao: 'area',
    modoLimiar: 'fixo',
    limiarAtencao: 80,
    limiarCritico: 95,
    minimo: 0,
    maximo: 1000000000,
    decimais: 2,
    subTextoPadrao: 'Banda de Saída no Link WAN',
    categoria: 'traffic',
  },
  fw_vpn_status: {
    rotulo: 'Status de Túneis VPN',
    icone: '🔒',
    unidadePadrao: 'status',
    graficoPadrao: 'nenhum',
    modoLimiar: 'normal',
    limiarAtencao: 1,
    limiarCritico: 0,
    minimo: 0,
    maximo: 1,
    decimais: 0,
    subTextoPadrao: 'Conectividade IPsec / SSL VPN',
    categoria: 'status',
  },
  fw_ameacas_bloqueadas: {
    rotulo: 'Ameaças / Ataques Bloqueados',
    icone: '🚨',
    unidadePadrao: 'numero',
    graficoPadrao: 'torre',
    modoLimiar: 'normal',
    limiarAtencao: 10,
    limiarCritico: 50,
    minimo: 0,
    maximo: 100,
    decimais: 0,
    subTextoPadrao: 'Eventos de Segurança IPS / Antivírus',
    categoria: 'counter',
  },
  fw_uptime: {
    rotulo: 'Uptime do Firewall',
    icone: '⏱️',
    unidadePadrao: 'uptime',
    graficoPadrao: 'nenhum',
    modoLimiar: 'fixo',
    limiarAtencao: 70,
    limiarCritico: 85,
    minimo: 0,
    maximo: 100,
    decimais: 0,
    subTextoPadrao: 'Tempo Contínuo de Operação',
    categoria: 'uptime',
  },

  // ==========================================
  // 2. MÁQUINAS VIRTUAIS (VMs)
  // ==========================================
  vm_estado: {
    rotulo: 'Estado da Máquina Virtual',
    icone: '📦',
    unidadePadrao: 'status_vm',
    graficoPadrao: 'nenhum',
    modoLimiar: 'normal',
    limiarAtencao: 1,
    limiarCritico: 0,
    minimo: 0,
    maximo: 1,
    decimais: 0,
    subTextoPadrao: 'Power State no Hipervisor',
    categoria: 'status',
  },
  vm_cpu_uso: {
    rotulo: 'Uso de vCPU da VM',
    icone: '📈',
    unidadePadrao: 'percent',
    graficoPadrao: 'circulo',
    modoLimiar: 'normal',
    limiarAtencao: 75,
    limiarCritico: 90,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Consumo de Processamento Virtual',
    categoria: 'percentage',
  },
  vm_cpu_ready: {
    rotulo: 'CPU Ready / Contenção',
    icone: '⚡',
    unidadePadrao: 'percent',
    graficoPadrao: 'barra',
    modoLimiar: 'normal',
    limiarAtencao: 5,
    limiarCritico: 10,
    minimo: 0,
    maximo: 25,
    decimais: 2,
    subTextoPadrao: 'Espera de Agendamento no Host (< 5% ideal)',
    categoria: 'percentage',
  },
  vm_memoria_uso: {
    rotulo: 'Uso de Memória da VM',
    icone: '🧠',
    unidadePadrao: 'percent',
    graficoPadrao: 'barra',
    modoLimiar: 'normal',
    limiarAtencao: 80,
    limiarCritico: 92,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Memória Guest Alocada / Ativa',
    categoria: 'percentage',
  },
  vm_disco_usado: {
    rotulo: 'Uso de Disco Virtual',
    icone: '💿',
    unidadePadrao: 'percent',
    graficoPadrao: 'barra',
    modoLimiar: 'normal',
    limiarAtencao: 75,
    limiarCritico: 90,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Ocupação de Partição da VM',
    categoria: 'disk',
  },
  vm_disco_livre: {
    rotulo: 'Espaço Livre na VM',
    icone: '💾',
    unidadePadrao: 'bytes',
    graficoPadrao: 'torre',
    modoLimiar: 'fixo',
    limiarAtencao: 75,
    limiarCritico: 90,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Volume Disponível no Disco Virtual',
    categoria: 'bytes',
  },
  vm_iops: {
    rotulo: 'IOPS de Disco da VM',
    icone: '🔄',
    unidadePadrao: 'iops',
    graficoPadrao: 'area',
    modoLimiar: 'fixo',
    limiarAtencao: 500,
    limiarCritico: 1000,
    minimo: 0,
    maximo: 2000,
    decimais: 1,
    subTextoPadrao: 'Operações de Leitura/Escrita por Seg',
    categoria: 'counter',
  },
  vm_snapshots: {
    rotulo: 'Snapshots Ativos na VM',
    icone: '📸',
    unidadePadrao: 'numero',
    graficoPadrao: 'torre',
    modoLimiar: 'normal',
    limiarAtencao: 1,
    limiarCritico: 3,
    minimo: 0,
    maximo: 10,
    decimais: 0,
    subTextoPadrao: 'Pontos de Restauração Retidos',
    categoria: 'counter',
  },
  vm_rede: {
    rotulo: 'Tráfego de Rede vNIC',
    icone: '🌐',
    unidadePadrao: 'bps',
    graficoPadrao: 'area',
    modoLimiar: 'fixo',
    limiarAtencao: 70,
    limiarCritico: 90,
    minimo: 0,
    maximo: 1000000000,
    decimais: 2,
    subTextoPadrao: 'Taxa de Transferência da Interface Virtual',
    categoria: 'traffic',
  },
  vm_uptime: {
    rotulo: 'Uptime da VM',
    icone: '⏱️',
    unidadePadrao: 'uptime',
    graficoPadrao: 'nenhum',
    modoLimiar: 'fixo',
    limiarAtencao: 70,
    limiarCritico: 85,
    minimo: 0,
    maximo: 100,
    decimais: 0,
    subTextoPadrao: 'Tempo de Atividade do Sistema Guest',
    categoria: 'uptime',
  },

  // ==========================================
  // 3. PROXY
  // ==========================================
  proxy_status: {
    rotulo: 'Status do Servidor Proxy',
    icone: '🌐',
    unidadePadrao: 'status',
    graficoPadrao: 'nenhum',
    modoLimiar: 'normal',
    limiarAtencao: 1,
    limiarCritico: 0,
    minimo: 0,
    maximo: 1,
    decimais: 0,
    subTextoPadrao: 'Serviço de Proxy / Encaminhamento Web',
    categoria: 'status',
  },
  proxy_requisicoes_seg: {
    rotulo: 'Requisições por Segundo',
    icone: '⚡',
    unidadePadrao: 'reqps',
    graficoPadrao: 'area',
    modoLimiar: 'fixo',
    limiarAtencao: 500,
    limiarCritico: 1000,
    minimo: 0,
    maximo: 2000,
    decimais: 1,
    subTextoPadrao: 'Taxa de Solicitações HTTP/HTTPS',
    categoria: 'traffic',
  },
  proxy_cache_hit: {
    rotulo: 'Taxa de Cache Hit',
    icone: '🎯',
    unidadePadrao: 'percent',
    graficoPadrao: 'circulo',
    modoLimiar: 'invertido',
    limiarAtencao: 70,
    limiarCritico: 85,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Eficiência de Respostas em Cache',
    categoria: 'percentage',
  },
  proxy_latencia: {
    rotulo: 'Latência / Tempo de Resposta',
    icone: '⏱️',
    unidadePadrao: 'ms',
    graficoPadrao: 'torre',
    modoLimiar: 'normal',
    limiarAtencao: 150,
    limiarCritico: 400,
    minimo: 0,
    maximo: 1000,
    decimais: 1,
    subTextoPadrao: 'Tempo Médio de Resposta do Proxy',
    categoria: 'latency',
  },
  proxy_conexoes_ativas: {
    rotulo: 'Conexões / Clientes Ativos',
    icone: '👥',
    unidadePadrao: 'clientes',
    graficoPadrao: 'area',
    modoLimiar: 'fixo',
    limiarAtencao: 500,
    limiarCritico: 1000,
    minimo: 0,
    maximo: 2000,
    decimais: 0,
    subTextoPadrao: 'Sessões Simultâneas no Proxy',
    categoria: 'counter',
  },
  proxy_banda: {
    rotulo: 'Consumo de Banda do Proxy',
    icone: '📶',
    unidadePadrao: 'bps',
    graficoPadrao: 'area',
    modoLimiar: 'fixo',
    limiarAtencao: 70,
    limiarCritico: 90,
    minimo: 0,
    maximo: 1000000000,
    decimais: 2,
    subTextoPadrao: 'Throughput Total de Dados no Proxy',
    categoria: 'traffic',
  },
  proxy_cpu: {
    rotulo: 'Uso de CPU do Proxy',
    icone: '📈',
    unidadePadrao: 'percent',
    graficoPadrao: 'barra',
    modoLimiar: 'normal',
    limiarAtencao: 70,
    limiarCritico: 85,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Carga de Processamento do Proxy',
    categoria: 'percentage',
  },
  proxy_memoria: {
    rotulo: 'Uso de Memória do Proxy',
    icone: '🧠',
    unidadePadrao: 'percent',
    graficoPadrao: 'barra',
    modoLimiar: 'normal',
    limiarAtencao: 75,
    limiarCritico: 90,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Memória de Cache e Processos',
    categoria: 'percentage',
  },
  proxy_erros_http: {
    rotulo: 'Erros HTTP (4xx / 5xx)',
    icone: '⚠️',
    unidadePadrao: 'numero',
    graficoPadrao: 'torre',
    modoLimiar: 'normal',
    limiarAtencao: 5,
    limiarCritico: 25,
    minimo: 0,
    maximo: 100,
    decimais: 0,
    subTextoPadrao: 'Falhas de Requisição ou Gateway',
    categoria: 'counter',
  },

  // ==========================================
  // 4. HOST / HIPERVISOR
  // ==========================================
  host_status: {
    rotulo: 'Status do Host / Hipervisor',
    icone: '🖧',
    unidadePadrao: 'status',
    graficoPadrao: 'nenhum',
    modoLimiar: 'normal',
    limiarAtencao: 1,
    limiarCritico: 0,
    minimo: 0,
    maximo: 1,
    decimais: 0,
    subTextoPadrao: 'Conectividade do Servidor Físico',
    categoria: 'status',
  },
  host_saude: {
    rotulo: 'Saúde Geral do Hardware',
    icone: '🩺',
    unidadePadrao: 'saude',
    graficoPadrao: 'nenhum',
    modoLimiar: 'normal',
    limiarAtencao: 2,
    limiarCritico: 3,
    minimo: 0,
    maximo: 3,
    decimais: 0,
    subTextoPadrao: 'Sensores de Placa, Fontes e RAID',
    categoria: 'status',
  },
  host_cpu_uso: {
    rotulo: 'Uso de CPU Física do Host',
    icone: '📈',
    unidadePadrao: 'percent',
    graficoPadrao: 'circulo',
    modoLimiar: 'normal',
    limiarAtencao: 75,
    limiarCritico: 90,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Carga Total dos Processadores Físicos',
    categoria: 'percentage',
  },
  host_memoria_uso: {
    rotulo: 'Uso de Memória Física',
    icone: '🧠',
    unidadePadrao: 'percent',
    graficoPadrao: 'barra',
    modoLimiar: 'normal',
    limiarAtencao: 80,
    limiarCritico: 92,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Consumo de RAM do Hipervisor',
    categoria: 'percentage',
  },
  host_datastore_uso: {
    rotulo: 'Uso de Datastore / Storage',
    icone: '💿',
    unidadePadrao: 'percent',
    graficoPadrao: 'barra',
    modoLimiar: 'normal',
    limiarAtencao: 75,
    limiarCritico: 90,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Ocupação do Armazenamento Compartilhado',
    categoria: 'disk',
  },
  host_datastore_livre: {
    rotulo: 'Espaço Livre no Datastore',
    icone: '💾',
    unidadePadrao: 'bytes',
    graficoPadrao: 'torre',
    modoLimiar: 'fixo',
    limiarAtencao: 75,
    limiarCritico: 90,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Capacidade Disponível para Provisionamento',
    categoria: 'bytes',
  },
  host_vms_ativas: {
    rotulo: 'Total de VMs no Host',
    icone: '📦',
    unidadePadrao: 'numero',
    graficoPadrao: 'torre',
    modoLimiar: 'fixo',
    limiarAtencao: 50,
    limiarCritico: 100,
    minimo: 0,
    maximo: 100,
    decimais: 0,
    subTextoPadrao: 'Máquinas Virtuais Hospedadas',
    categoria: 'counter',
  },
  host_temperatura: {
    rotulo: 'Temperatura do Hardware',
    icone: '🌡️',
    unidadePadrao: 'celsius',
    graficoPadrao: 'termometro',
    modoLimiar: 'normal',
    limiarAtencao: 65,
    limiarCritico: 80,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Sensores Térmicos do Chassi / CPU',
    categoria: 'counter',
  },
  host_energia: {
    rotulo: 'Consumo Elétrico (Watts)',
    icone: '⚡',
    unidadePadrao: 'watts',
    graficoPadrao: 'area',
    modoLimiar: 'fixo',
    limiarAtencao: 500,
    limiarCritico: 800,
    minimo: 0,
    maximo: 1000,
    decimais: 0,
    subTextoPadrao: 'Potência Consumida pelas Fontes',
    categoria: 'counter',
  },
  host_uptime: {
    rotulo: 'Uptime do Host',
    icone: '⏱️',
    unidadePadrao: 'uptime',
    graficoPadrao: 'nenhum',
    modoLimiar: 'fixo',
    limiarAtencao: 70,
    limiarCritico: 85,
    minimo: 0,
    maximo: 100,
    decimais: 0,
    subTextoPadrao: 'Tempo de Atividade do Hipervisor',
    categoria: 'uptime',
  },

  // ==========================================
  // 5. SERVIDORES (WINDOWS / LINUX)
  // ==========================================
  srv_status_ping: {
    rotulo: 'Conectividade ICMP Ping',
    icone: '🌐',
    unidadePadrao: 'status',
    graficoPadrao: 'nenhum',
    modoLimiar: 'normal',
    limiarAtencao: 1,
    limiarCritico: 0,
    minimo: 0,
    maximo: 1,
    decimais: 0,
    subTextoPadrao: 'Resposta de Rede do Servidor',
    categoria: 'status',
  },
  srv_status_agent: {
    rotulo: 'Status do Zabbix Agent',
    icone: '🛡️',
    unidadePadrao: 'status',
    graficoPadrao: 'nenhum',
    modoLimiar: 'normal',
    limiarAtencao: 1,
    limiarCritico: 0,
    minimo: 0,
    maximo: 1,
    decimais: 0,
    subTextoPadrao: 'Comunicação do Agente de Monitoramento',
    categoria: 'status',
  },
  srv_cpu_uso: {
    rotulo: 'Uso de CPU do Servidor',
    icone: '📈',
    unidadePadrao: 'percent',
    graficoPadrao: 'circulo',
    modoLimiar: 'normal',
    limiarAtencao: 70,
    limiarCritico: 85,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Utilização de Processador do SO',
    categoria: 'percentage',
  },
  srv_cpu_fila: {
    rotulo: 'Fila de Processador (Queue)',
    icone: '📊',
    unidadePadrao: 'numero',
    graficoPadrao: 'torre',
    modoLimiar: 'normal',
    limiarAtencao: 2,
    limiarCritico: 5,
    minimo: 0,
    maximo: 10,
    decimais: 1,
    subTextoPadrao: 'Threads Aguardando Tempo de CPU',
    categoria: 'counter',
  },
  srv_memoria_uso: {
    rotulo: 'Uso de Memória RAM',
    icone: '🧠',
    unidadePadrao: 'percent',
    graficoPadrao: 'barra',
    modoLimiar: 'normal',
    limiarAtencao: 75,
    limiarCritico: 90,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Consumo de Memória Física do Servidor',
    categoria: 'percentage',
  },
  srv_memoria_livre: {
    rotulo: 'Memória RAM Disponível',
    icone: '🧠',
    unidadePadrao: 'bytes',
    graficoPadrao: 'torre',
    modoLimiar: 'fixo',
    limiarAtencao: 75,
    limiarCritico: 90,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Volume Livre de Memória RAM',
    categoria: 'bytes',
  },
  srv_disco_uso: {
    rotulo: 'Uso de Disco / Volume',
    icone: '💿',
    unidadePadrao: 'percent',
    graficoPadrao: 'barra',
    modoLimiar: 'normal',
    limiarAtencao: 75,
    limiarCritico: 90,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Percentual Ocupado na Partição',
    categoria: 'disk',
  },
  srv_disco_livre: {
    rotulo: 'Espaço Livre em Disco',
    icone: '💾',
    unidadePadrao: 'bytes',
    graficoPadrao: 'torre',
    modoLimiar: 'fixo',
    limiarAtencao: 75,
    limiarCritico: 90,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Capacidade Disponível para Gravação',
    categoria: 'bytes',
  },
  srv_disco_latencia: {
    rotulo: 'Latência de Disco',
    icone: '⏱️',
    unidadePadrao: 'ms',
    graficoPadrao: 'area',
    modoLimiar: 'normal',
    limiarAtencao: 20,
    limiarCritico: 50,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Tempo de Resposta de Leitura/Escrita',
    categoria: 'latency',
  },
  srv_rede_trafego: {
    rotulo: 'Tráfego de Rede do Servidor',
    icone: '⚡',
    unidadePadrao: 'bps',
    graficoPadrao: 'area',
    modoLimiar: 'fixo',
    limiarAtencao: 70,
    limiarCritico: 90,
    minimo: 0,
    maximo: 1000000000,
    decimais: 2,
    subTextoPadrao: 'Taxa de Transferência na Placa de Rede',
    categoria: 'traffic',
  },
  srv_servicos_parados: {
    rotulo: 'Serviços Parados / Alarmes',
    icone: '🚨',
    unidadePadrao: 'numero',
    graficoPadrao: 'torre',
    modoLimiar: 'normal',
    limiarAtencao: 1,
    limiarCritico: 2,
    minimo: 0,
    maximo: 10,
    decimais: 0,
    subTextoPadrao: 'Monitoramento de Serviços Críticos',
    categoria: 'counter',
  },
  srv_uptime: {
    rotulo: 'Uptime do Servidor',
    icone: '⏱️',
    unidadePadrao: 'uptime',
    graficoPadrao: 'nenhum',
    modoLimiar: 'fixo',
    limiarAtencao: 70,
    limiarCritico: 85,
    minimo: 0,
    maximo: 100,
    decimais: 0,
    subTextoPadrao: 'Tempo Ligado Desde o Último Boot',
    categoria: 'uptime',
  },

  // ==========================================
  // 6. ACCESS POINTS (WI-FI)
  // ==========================================
  ap_status: {
    rotulo: 'Status do Access Point',
    icone: '📡',
    unidadePadrao: 'status',
    graficoPadrao: 'nenhum',
    modoLimiar: 'normal',
    limiarAtencao: 1,
    limiarCritico: 0,
    minimo: 0,
    maximo: 1,
    decimais: 0,
    subTextoPadrao: 'Disponibilidade do Rádio / Ponto de Acesso',
    categoria: 'status',
  },
  ap_clientes: {
    rotulo: 'Clientes Wi-Fi Conectados',
    icone: '📱',
    unidadePadrao: 'clientes',
    graficoPadrao: 'torre',
    modoLimiar: 'normal',
    limiarAtencao: 45,
    limiarCritico: 70,
    minimo: 0,
    maximo: 100,
    decimais: 0,
    subTextoPadrao: 'Dispositivos Associados nos SSIDs',
    categoria: 'counter',
  },
  ap_sinal_qualidade: {
    rotulo: 'Qualidade do Sinal Wi-Fi',
    icone: '📶',
    unidadePadrao: 'percent',
    graficoPadrao: 'torre',
    modoLimiar: 'invertido',
    limiarAtencao: 60,
    limiarCritico: 75,
    minimo: 0,
    maximo: 100,
    decimais: 0,
    subTextoPadrao: 'Qualidade Média da Conexão Sem Fio',
    categoria: 'percentage',
  },
  ap_sinal_dbm: {
    rotulo: 'Potência de Sinal (RSSI)',
    icone: '📡',
    unidadePadrao: 'dbm',
    graficoPadrao: 'torre',
    modoLimiar: 'fixo',
    limiarAtencao: -70,
    limiarCritico: -80,
    minimo: -100,
    maximo: -30,
    decimais: 0,
    subTextoPadrao: 'Nível de Sinal Recebido em dBm',
    categoria: 'counter',
  },
  ap_interferencia: {
    rotulo: 'Ocupação do Canal / Interferência',
    icone: '🌊',
    unidadePadrao: 'percent',
    graficoPadrao: 'circulo',
    modoLimiar: 'normal',
    limiarAtencao: 60,
    limiarCritico: 80,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Saturação de Frequência 2.4GHz / 5GHz',
    categoria: 'percentage',
  },
  ap_trafego_in: {
    rotulo: 'Tráfego Wi-Fi Download',
    icone: '⬇️',
    unidadePadrao: 'bps',
    graficoPadrao: 'area',
    modoLimiar: 'fixo',
    limiarAtencao: 70,
    limiarCritico: 90,
    minimo: 0,
    maximo: 1000000000,
    decimais: 2,
    subTextoPadrao: 'Taxa de Recepção nos Rádios Sem Fio',
    categoria: 'traffic',
  },
  ap_trafego_out: {
    rotulo: 'Tráfego Wi-Fi Upload',
    icone: '⬆️',
    unidadePadrao: 'bps',
    graficoPadrao: 'area',
    modoLimiar: 'fixo',
    limiarAtencao: 70,
    limiarCritico: 90,
    minimo: 0,
    maximo: 1000000000,
    decimais: 2,
    subTextoPadrao: 'Taxa de Transmissão nos Rádios Sem Fio',
    categoria: 'traffic',
  },
  ap_cpu: {
    rotulo: 'Uso de CPU do Access Point',
    icone: '📈',
    unidadePadrao: 'percent',
    graficoPadrao: 'barra',
    modoLimiar: 'normal',
    limiarAtencao: 70,
    limiarCritico: 85,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Processamento Interno do AP',
    categoria: 'percentage',
  },
  ap_uptime: {
    rotulo: 'Uptime do Access Point',
    icone: '⏱️',
    unidadePadrao: 'uptime',
    graficoPadrao: 'nenhum',
    modoLimiar: 'fixo',
    limiarAtencao: 70,
    limiarCritico: 85,
    minimo: 0,
    maximo: 100,
    decimais: 0,
    subTextoPadrao: 'Tempo Contínuo de Operação do AP',
    categoria: 'uptime',
  },

  // ==========================================
  // 7. PORTAS DE REDE / SWITCH
  // ==========================================
  porta_status: {
    rotulo: 'Status da Porta de Rede',
    icone: '🔌',
    unidadePadrao: 'status_porta',
    graficoPadrao: 'nenhum',
    modoLimiar: 'normal',
    limiarAtencao: 1,
    limiarCritico: 0,
    minimo: 0,
    maximo: 1,
    decimais: 0,
    subTextoPadrao: 'Estado Operacional do Link (UP / DOWN)',
    categoria: 'status',
  },
  porta_trafego_in: {
    rotulo: 'Tráfego de Entrada (RX)',
    icone: '⬇️',
    unidadePadrao: 'bps',
    graficoPadrao: 'area',
    modoLimiar: 'fixo',
    limiarAtencao: 70,
    limiarCritico: 90,
    minimo: 0,
    maximo: 1000000000,
    decimais: 2,
    subTextoPadrao: 'Bits Recebidos por Segundo na Porta',
    categoria: 'traffic',
  },
  porta_trafego_out: {
    rotulo: 'Tráfego de Saída (TX)',
    icone: '⬆️',
    unidadePadrao: 'bps',
    graficoPadrao: 'area',
    modoLimiar: 'fixo',
    limiarAtencao: 70,
    limiarCritico: 90,
    minimo: 0,
    maximo: 1000000000,
    decimais: 2,
    subTextoPadrao: 'Bits Transmitidos por Segundo na Porta',
    categoria: 'traffic',
  },
  porta_utilizacao_pct: {
    rotulo: 'Utilização da Porta (%)',
    icone: '📊',
    unidadePadrao: 'percent',
    graficoPadrao: 'barra',
    modoLimiar: 'normal',
    limiarAtencao: 70,
    limiarCritico: 85,
    minimo: 0,
    maximo: 100,
    decimais: 1,
    subTextoPadrao: 'Saturação da Capacidade do Link',
    categoria: 'percentage',
  },
  porta_pacotes_seg: {
    rotulo: 'Fluxo de Pacotes (pps)',
    icone: '📦',
    unidadePadrao: 'pps',
    graficoPadrao: 'area',
    modoLimiar: 'fixo',
    limiarAtencao: 10000,
    limiarCritico: 50000,
    minimo: 0,
    maximo: 100000,
    decimais: 0,
    subTextoPadrao: 'Pacotes Encaminhados por Segundo',
    categoria: 'traffic',
  },
  porta_erros: {
    rotulo: 'Erros CRC / Descartes na Porta',
    icone: '⚠️',
    unidadePadrao: 'numero',
    graficoPadrao: 'torre',
    modoLimiar: 'normal',
    limiarAtencao: 1,
    limiarCritico: 10,
    minimo: 0,
    maximo: 100,
    decimais: 0,
    subTextoPadrao: 'Integridade Física do Cabo / Transceiver',
    categoria: 'counter',
  },
  porta_velocidade: {
    rotulo: 'Velocidade Negociada da Porta',
    icone: '⚡',
    unidadePadrao: 'bps',
    graficoPadrao: 'nenhum',
    modoLimiar: 'fixo',
    limiarAtencao: 70,
    limiarCritico: 90,
    minimo: 0,
    maximo: 10000000000,
    decimais: 0,
    subTextoPadrao: 'Speed Duplex da Interface do Switch',
    categoria: 'traffic',
  },
  porta_poe_watts: {
    rotulo: 'Consumo PoE da Porta (Watts)',
    icone: '🔋',
    unidadePadrao: 'watts',
    graficoPadrao: 'barra',
    modoLimiar: 'normal',
    limiarAtencao: 20,
    limiarCritico: 27,
    minimo: 0,
    maximo: 30,
    decimais: 1,
    subTextoPadrao: 'Alimentação Power over Ethernet',
    categoria: 'counter',
  },
};

/**
 * Obtém o tipo de dispositivo ativo considerando a opção nova ou mapeando o legado
 */
export function obterDispositivoAtivo(opcoes?: Partial<PanelOptions>): DeviceType {
  if (opcoes?.deviceType && opcoes.deviceType !== 'auto') {
    return opcoes.deviceType;
  }
  // Compatibilidade com configurações antigas
  switch (opcoes?.panelType) {
    case 'firewall':
      return 'firewall';
    case 'vmware':
      return 'vm';
    case 'disk':
    case 'cpu':
    case 'memory':
    case 'system':
      return 'servidor';
    case 'network':
      return 'porta_rede';
    default:
      return 'auto';
  }
}

/**
 * Retorna a métrica única "forçada" para o dispositivo ativo.
 *
 * Os antigos seletores "O que Monitorar no ..." (firewallMetric, vmMetric, etc.) foram
 * removidos do editor: a escolha das métricas agora é feita somente em
 * "Quais Métricas Monitorar" (selectedMetrics) ou pela detecção automática da query.
 * Por isso os valores legados salvos em dashboards antigos são ignorados aqui,
 * evitando uma configuração oculta que o usuário não consegue mais alterar.
 */
export function obterMetricaDispositivoAtiva(
  _opcoes?: Partial<PanelOptions>
): AnyDeviceMetricType | null {
  return null;
}

export interface OpcaoMetricaDispositivo {
  value: AnyDeviceMetricType;
  label: string;
  icone: string;
  essencial?: boolean;
  dispositivo: Exclude<DeviceType, 'auto'>;
}

/**
 * Catálogo completo de métricas selecionáveis por tipo de dispositivo
 */
export const METRICAS_POR_DISPOSITIVO: Record<
  Exclude<DeviceType, 'auto'>,
  OpcaoMetricaDispositivo[]
> = {
  firewall: [
    { value: 'fw_status', label: 'Status do Firewall (Online / Offline)', icone: '🛡️', essencial: true, dispositivo: 'firewall' },
    { value: 'fw_cpu', label: 'Uso de CPU do Firewall (%)', icone: '📈', essencial: true, dispositivo: 'firewall' },
    { value: 'fw_memoria', label: 'Uso de Memória do Firewall (%)', icone: '🧠', essencial: true, dispositivo: 'firewall' },
    { value: 'fw_sessoes', label: 'Sessões Concorrentes Ativas', icone: '👥', essencial: true, dispositivo: 'firewall' },
    { value: 'fw_trafego_wan_in', label: 'Tráfego WAN Download / Entrada (bps)', icone: '⬇️', essencial: true, dispositivo: 'firewall' },
    { value: 'fw_trafego_wan_out', label: 'Tráfego WAN Upload / Saída (bps)', icone: '⬆️', dispositivo: 'firewall' },
    { value: 'fw_vpn_status', label: 'Status de Túneis VPN (IPsec / SSL)', icone: '🔒', dispositivo: 'firewall' },
    { value: 'fw_ameacas_bloqueadas', label: 'Ameaças / Ataques Bloqueados (IPS)', icone: '🚨', dispositivo: 'firewall' },
    { value: 'fw_uptime', label: 'Tempo de Atividade (Uptime)', icone: '⏱️', dispositivo: 'firewall' },
  ],
  vm: [
    { value: 'vm_estado', label: 'Estado da VM (Ligada / Desligada)', icone: '📦', essencial: true, dispositivo: 'vm' },
    { value: 'vm_cpu_uso', label: 'Uso de vCPU da VM (%)', icone: '📈', essencial: true, dispositivo: 'vm' },
    { value: 'vm_cpu_ready', label: 'CPU Ready / Contenção (%)', icone: '⚡', dispositivo: 'vm' },
    { value: 'vm_memoria_uso', label: 'Uso de Memória RAM da VM (%)', icone: '🧠', essencial: true, dispositivo: 'vm' },
    { value: 'vm_disco_usado', label: 'Espaço em Disco Usado (%)', icone: '💿', essencial: true, dispositivo: 'vm' },
    { value: 'vm_disco_livre', label: 'Espaço em Disco Livre (GB / TB)', icone: '💾', dispositivo: 'vm' },
    { value: 'vm_iops', label: 'IOPS de Disco Virtual', icone: '🔄', dispositivo: 'vm' },
    { value: 'vm_snapshots', label: 'Snapshots Ativos na VM', icone: '📸', dispositivo: 'vm' },
    { value: 'vm_rede', label: 'Tráfego de Rede vNIC (bps)', icone: '🌐', dispositivo: 'vm' },
    { value: 'vm_uptime', label: 'Uptime da VM', icone: '⏱️', dispositivo: 'vm' },
  ],
  proxy: [
    { value: 'proxy_status', label: 'Status do Serviço Proxy (Online / Offline)', icone: '🌐', essencial: true, dispositivo: 'proxy' },
    { value: 'proxy_requisicoes_seg', label: 'Requisições por Segundo (req/s)', icone: '⚡', essencial: true, dispositivo: 'proxy' },
    { value: 'proxy_cache_hit', label: 'Taxa de Cache Hit (%)', icone: '🎯', essencial: true, dispositivo: 'proxy' },
    { value: 'proxy_latencia', label: 'Latência / Tempo de Resposta HTTP (ms)', icone: '⏱️', essencial: true, dispositivo: 'proxy' },
    { value: 'proxy_conexoes_ativas', label: 'Conexões / Clientes Ativos', icone: '👥', dispositivo: 'proxy' },
    { value: 'proxy_banda', label: 'Consumo de Banda do Proxy (bps)', icone: '📶', dispositivo: 'proxy' },
    { value: 'proxy_cpu', label: 'Uso de CPU do Proxy (%)', icone: '📈', dispositivo: 'proxy' },
    { value: 'proxy_memoria', label: 'Uso de Memória do Proxy (%)', icone: '🧠', dispositivo: 'proxy' },
    { value: 'proxy_erros_http', label: 'Erros HTTP (4xx / 5xx)', icone: '⚠️', dispositivo: 'proxy' },
  ],
  host: [
    { value: 'host_status', label: 'Status do Host / Hipervisor (Online / Offline)', icone: '🖧', essencial: true, dispositivo: 'host' },
    { value: 'host_saude', label: 'Saúde Geral do Hardware (Health State)', icone: '🩺', dispositivo: 'host' },
    { value: 'host_cpu_uso', label: 'Uso de CPU Física (%)', icone: '📈', essencial: true, dispositivo: 'host' },
    { value: 'host_memoria_uso', label: 'Uso de Memória Física (%)', icone: '🧠', essencial: true, dispositivo: 'host' },
    { value: 'host_datastore_uso', label: 'Uso de Datastore / Storage (%)', icone: '💿', essencial: true, dispositivo: 'host' },
    { value: 'host_datastore_livre', label: 'Espaço Livre no Datastore (GB / TB)', icone: '💾', dispositivo: 'host' },
    { value: 'host_vms_ativas', label: 'Total de VMs Hospedadas no Host', icone: '📦', dispositivo: 'host' },
    { value: 'host_temperatura', label: 'Temperatura do Hardware (°C)', icone: '🌡️', dispositivo: 'host' },
    { value: 'host_energia', label: 'Consumo Elétrico (Watts)', icone: '⚡', dispositivo: 'host' },
    { value: 'host_uptime', label: 'Uptime do Host', icone: '⏱️', dispositivo: 'host' },
  ],
  servidor: [
    { value: 'srv_status_ping', label: 'Conectividade ICMP Ping (Online / Offline)', icone: '🌐', essencial: true, dispositivo: 'servidor' },
    { value: 'srv_status_agent', label: 'Status do Zabbix Agent (Online / Offline)', icone: '🛡️', dispositivo: 'servidor' },
    { value: 'srv_cpu_uso', label: 'Uso de CPU do Servidor (%)', icone: '📈', essencial: true, dispositivo: 'servidor' },
    { value: 'srv_cpu_fila', label: 'Fila de Processador (CPU Queue)', icone: '📊', dispositivo: 'servidor' },
    { value: 'srv_memoria_uso', label: 'Uso de Memória RAM (%)', icone: '🧠', essencial: true, dispositivo: 'servidor' },
    { value: 'srv_memoria_livre', label: 'Memória RAM Livre (GB)', icone: '🧠', dispositivo: 'servidor' },
    { value: 'srv_disco_uso', label: 'Uso de Disco / Partição (%)', icone: '💿', essencial: true, dispositivo: 'servidor' },
    { value: 'srv_disco_livre', label: 'Espaço Livre em Disco (GB / TB)', icone: '💾', dispositivo: 'servidor' },
    { value: 'srv_disco_latencia', label: 'Latência de Disco (ms)', icone: '⏱️', dispositivo: 'servidor' },
    { value: 'srv_rede_trafego', label: 'Tráfego de Rede do Servidor (bps)', icone: '⚡', dispositivo: 'servidor' },
    { value: 'srv_servicos_parados', label: 'Serviços Parados / Incidentes', icone: '🚨', dispositivo: 'servidor' },
    { value: 'srv_uptime', label: 'Uptime do Servidor', icone: '⏱️', essencial: true, dispositivo: 'servidor' },
  ],
  access_point: [
    { value: 'ap_status', label: 'Status do Access Point (Online / Offline)', icone: '📡', essencial: true, dispositivo: 'access_point' },
    { value: 'ap_clientes', label: 'Clientes Wi-Fi Conectados', icone: '📱', essencial: true, dispositivo: 'access_point' },
    { value: 'ap_sinal_qualidade', label: 'Qualidade do Sinal Wi-Fi (%)', icone: '📶', essencial: true, dispositivo: 'access_point' },
    { value: 'ap_sinal_dbm', label: 'Potência de Sinal / RSSI (dBm)', icone: '📡', dispositivo: 'access_point' },
    { value: 'ap_interferencia', label: 'Ocupação do Canal / Interferência (%)', icone: '🌊', dispositivo: 'access_point' },
    { value: 'ap_trafego_in', label: 'Tráfego Wi-Fi Download (bps)', icone: '⬇️', essencial: true, dispositivo: 'access_point' },
    { value: 'ap_trafego_out', label: 'Tráfego Wi-Fi Upload (bps)', icone: '⬆️', dispositivo: 'access_point' },
    { value: 'ap_cpu', label: 'Uso de CPU do Access Point (%)', icone: '📈', dispositivo: 'access_point' },
    { value: 'ap_uptime', label: 'Uptime do Access Point', icone: '⏱️', dispositivo: 'access_point' },
  ],
  porta_rede: [
    { value: 'porta_status', label: 'Status da Porta (UP / DOWN)', icone: '🔌', essencial: true, dispositivo: 'porta_rede' },
    { value: 'porta_trafego_in', label: 'Tráfego de Entrada / RX (bps)', icone: '⬇️', essencial: true, dispositivo: 'porta_rede' },
    { value: 'porta_trafego_out', label: 'Tráfego de Saída / TX (bps)', icone: '⬆️', essencial: true, dispositivo: 'porta_rede' },
    { value: 'porta_utilizacao_pct', label: 'Utilização da Banda da Porta (%)', icone: '📊', essencial: true, dispositivo: 'porta_rede' },
    { value: 'porta_pacotes_seg', label: 'Fluxo de Pacotes por Segundo (pps)', icone: '📦', dispositivo: 'porta_rede' },
    { value: 'porta_erros', label: 'Erros CRC / Descartes na Porta', icone: '⚠️', dispositivo: 'porta_rede' },
    { value: 'porta_velocidade', label: 'Velocidade Negociada (100M / 1G / 10G)', icone: '⚡', dispositivo: 'porta_rede' },
    { value: 'porta_poe_watts', label: 'Consumo PoE da Porta (Watts)', icone: '🔋', dispositivo: 'porta_rede' },
  ],
};

/**
 * Retorna a lista de métricas disponíveis para o dispositivo selecionado.
 * Se o dispositivo estiver em 'auto', retorna as métricas do Servidor como padrão ou todas.
 */
export function obterMetricasDisponiveisParaDispositivo(
  dispositivo: DeviceType
): OpcaoMetricaDispositivo[] {
  if (dispositivo !== 'auto' && METRICAS_POR_DISPOSITIVO[dispositivo]) {
    return METRICAS_POR_DISPOSITIVO[dispositivo];
  }
  return METRICAS_POR_DISPOSITIVO.servidor;
}

/**
 * Verifica se o painel está configurado em modo de múltiplas métricas.
 * Como a métrica única legada foi descontinuada, o painel sempre trabalha
 * com a seleção de métricas (ou detecção automática da query).
 */
export function estaEmModoMultiplasMetricas(opcoes?: Partial<PanelOptions>): boolean {
  if (!opcoes) {
    return false;
  }
  if (opcoes.cardDisplayMode === 'consolidado') {
    return true;
  }
  const metricaUnica = obterMetricaDispositivoAtiva(opcoes);
  return metricaUnica === null;
}

/**
 * Palavras-chave para associar automaticamente o nome de uma série/item do Zabbix
 * a uma das métricas pré-configuradas.
 */
const PALAVRAS_CHAVE_POR_METRICA: Record<string, { incluir: string[]; excluir?: string[] }> = {
  // Firewall
  fw_status: { incluir: ['ping', 'status', 'icmp', 'online', 'state', 'disponibilidade'], excluir: ['vpn', 'tunnel'] },
  fw_cpu: { incluir: ['cpu', 'processor', 'processador'], excluir: ['core', 'cores', 'núcleo', 'nucleo', 'núcleos', 'nucleos', 'count', 'number', 'número', 'numero', 'quantidade', 'qtd', 'temp', 'frequência', 'frequencia', 'frequency', 'mhz', 'ghz'] },
  fw_memoria: { incluir: ['mem', 'ram', 'memory', 'memória'] },
  fw_sessoes: { incluir: ['session', 'sessões', 'sessoes', 'concurr', 'conexões', 'connections'] },
  fw_trafego_wan_in: { incluir: ['wan in', 'download', 'rx', 'received', 'entrada', 'in ', 'inbound'] },
  fw_trafego_wan_out: { incluir: ['wan out', 'upload', 'tx', 'sent', 'saída', 'saida', 'out ', 'outbound'] },
  fw_vpn_status: { incluir: ['vpn', 'ipsec', 'ssl', 'tunnel', 'túnel'] },
  fw_ameacas_bloqueadas: { incluir: ['threat', 'ameaça', 'ips', 'attack', 'ataque', 'block', 'virus', 'intrusion'] },
  fw_uptime: { incluir: ['uptime', 'atividade', 'boot'] },

  // VM
  vm_estado: { incluir: ['power', 'state', 'estado', 'status', 'ping', 'ligada'] },
  vm_cpu_uso: { incluir: ['cpu', 'vcpu', 'processor'], excluir: ['ready', 'core', 'cores', 'núcleo', 'nucleo', 'núcleos', 'nucleos', 'count', 'number', 'número', 'numero', 'quantidade', 'qtd', 'temp', 'frequência', 'frequencia', 'frequency', 'mhz', 'ghz'] },
  vm_cpu_ready: { incluir: ['ready', 'contenç', 'contention'] },
  vm_memoria_uso: { incluir: ['mem', 'ram', 'memory', 'memória'] },
  vm_disco_usado: { incluir: ['disk', 'disco', 'partição', 'partition', 'storage', 'vfs.fs'], excluir: ['free', 'livre', 'iops'] },
  vm_disco_livre: { incluir: ['free', 'livre', 'available'], excluir: ['mem', 'ram'] },
  vm_iops: { incluir: ['iops', 'io ', 'operations', 'leitura', 'escrita'] },
  vm_snapshots: { incluir: ['snapshot'] },
  vm_rede: { incluir: ['net', 'rede', 'vnic', 'traffic', 'tráfego', 'bps', 'bits'] },
  vm_uptime: { incluir: ['uptime', 'atividade', 'boot'] },

  // Proxy
  proxy_status: { incluir: ['status', 'ping', 'online', 'service', 'squid', 'nginx', 'haproxy'] },
  proxy_requisicoes_seg: { incluir: ['req', 'request', 'solicita', 'http/s', 'rps'] },
  proxy_cache_hit: { incluir: ['cache', 'hit'] },
  proxy_latencia: { incluir: ['latenc', 'latênc', 'response time', 'tempo de resposta', 'duration'] },
  proxy_conexoes_ativas: { incluir: ['conn', 'conex', 'client', 'clientes', 'active'] },
  proxy_banda: { incluir: ['band', 'traffic', 'tráfego', 'bps', 'bytes', 'in', 'out'] },
  proxy_cpu: { incluir: ['cpu', 'processor'], excluir: ['core', 'cores', 'núcleo', 'nucleo', 'núcleos', 'nucleos', 'count', 'number', 'número', 'numero', 'quantidade', 'qtd', 'temp', 'frequência', 'frequencia', 'frequency', 'mhz', 'ghz'] },
  proxy_memoria: { incluir: ['mem', 'ram', 'memory'] },
  proxy_erros_http: { incluir: ['err', '5xx', '4xx', 'fail', 'falha'] },

  // Host
  host_status: { incluir: ['status', 'ping', 'icmp', 'online', 'connection'] },
  host_saude: { incluir: ['health', 'saúde', 'saude', 'overall', 'sensor', 'raid'] },
  host_cpu_uso: { incluir: ['cpu', 'processor', 'processador'], excluir: ['core', 'cores', 'núcleo', 'nucleo', 'núcleos', 'nucleos', 'count', 'number', 'número', 'numero', 'quantidade', 'qtd', 'temp', 'frequência', 'frequencia', 'frequency', 'mhz', 'ghz'] },
  host_memoria_uso: { incluir: ['mem', 'ram', 'memory', 'memória'] },
  host_datastore_uso: { incluir: ['datastore', 'storage', 'disk', 'disco'], excluir: ['free', 'livre'] },
  host_datastore_livre: { incluir: ['free', 'livre', 'available'] },
  host_vms_ativas: { incluir: ['vm', 'guest', 'máquinas', 'virtual'] },
  host_temperatura: { incluir: ['temp', '°c', 'celsius', 'thermal', 'térmic'] },
  host_energia: { incluir: ['watt', 'power', 'energia', 'elétric', 'consumo'] },
  host_uptime: { incluir: ['uptime', 'atividade', 'boot'] },

  // Servidor
  srv_status_ping: { incluir: ['ping', 'icmp', 'conectividade'], excluir: ['latency', 'latência', 'loss'] },
  srv_status_agent: { incluir: ['agent', 'zabbix'] },
  srv_cpu_uso: { incluir: ['cpu', 'processor', 'processador'], excluir: ['queue', 'fila', 'load', 'core', 'cores', 'núcleo', 'nucleo', 'núcleos', 'nucleos', 'count', 'number', 'número', 'numero', 'quantidade', 'qtd', 'temp', 'frequência', 'frequencia', 'frequency', 'mhz', 'ghz'] },
  srv_cpu_fila: { incluir: ['queue', 'fila', 'load'] },
  srv_memoria_uso: { incluir: ['mem', 'ram', 'memory', 'memória'], excluir: ['free', 'livre', 'available', 'disponível'] },
  srv_memoria_livre: { incluir: ['mem free', 'ram free', 'available memory', 'memória livre', 'memoria livre', 'ram disponível'] },
  srv_disco_uso: { incluir: ['disk', 'disco', 'partição', 'vfs.fs', 'c:', '/', 'space used', 'usado'], excluir: ['free', 'livre', 'latency', 'latência', 'read', 'write'] },
  srv_disco_livre: { incluir: ['free disk', 'free space', 'disco livre', 'espaço livre', 'espaco livre', 'available space'] },
  srv_disco_latencia: { incluir: ['disk latency', 'latência de disco', 'latencia de disco', 'await', 'response time', 'read time', 'write time'] },
  srv_rede_trafego: { incluir: ['net', 'rede', 'traffic', 'tráfego', 'trafego', 'bps', 'bits', 'eth', 'ens', 'interface'] },
  srv_servicos_parados: { incluir: ['service', 'serviço', 'servico', 'stopped', 'parado', 'alarm', 'incidente'] },
  srv_uptime: { incluir: ['uptime', 'atividade', 'boot'] },

  // Access Point
  ap_status: { incluir: ['status', 'ping', 'online', 'state'] },
  ap_clientes: { incluir: ['client', 'clientes', 'user', 'usuários', 'associated', 'conectados', 'stations'] },
  ap_sinal_qualidade: { incluir: ['quality', 'qualidade', 'ccq', 'signal %'] },
  ap_sinal_dbm: { incluir: ['dbm', 'rssi', 'potência', 'signal strength'] },
  ap_interferencia: { incluir: ['interfer', 'channel', 'canal', 'noise', 'ruído', 'ocupação', 'utilization'] },
  ap_trafego_in: { incluir: ['download', 'rx', 'received', 'in', 'entrada'] },
  ap_trafego_out: { incluir: ['upload', 'tx', 'sent', 'out', 'saída'] },
  ap_cpu: { incluir: ['cpu', 'processor'], excluir: ['core', 'cores', 'núcleo', 'nucleo', 'núcleos', 'nucleos', 'count', 'number', 'número', 'numero', 'quantidade', 'qtd', 'temp', 'frequência', 'frequencia', 'frequency', 'mhz', 'ghz'] },
  ap_uptime: { incluir: ['uptime', 'atividade'] },

  // Porta de Rede
  porta_status: { incluir: ['status', 'operstatus', 'link', 'state', 'up', 'down'] },
  porta_trafego_in: { incluir: ['rx', 'in', 'received', 'entrada', 'download', 'hcinoctets'] },
  porta_trafego_out: { incluir: ['tx', 'out', 'sent', 'saída', 'saida', 'upload', 'hcoutoctets'] },
  porta_utilizacao_pct: { incluir: ['utiliz', 'uso', 'usage', 'banda %', 'saturation'] },
  porta_pacotes_seg: { incluir: ['packet', 'pacote', 'pps', 'unicast', 'multicast'] },
  porta_erros: { incluir: ['err', 'crc', 'discard', 'descarte', 'drop', 'collision'] },
  porta_velocidade: { incluir: ['speed', 'velocidade', 'duplex', 'highspeed'] },
  porta_poe_watts: { incluir: ['poe', 'watt', 'power', 'alimentação'] },
};

/**
 * Identifica a métrica pré-configurada correspondente ao texto da série/item do Zabbix
 */
export function detectarSubTipoMetricaPorTexto(
  texto: string,
  dispositivo: DeviceType,
  metricasCandidatas?: AnyDeviceMetricType[]
): AnyDeviceMetricType | null {
  const txt = texto.toLowerCase();
  const listaCandidatas: AnyDeviceMetricType[] =
    metricasCandidatas && metricasCandidatas.length > 0
      ? metricasCandidatas
      : obterMetricasDisponiveisParaDispositivo(dispositivo).map((m) => m.value);

  for (const chave of listaCandidatas) {
    const regra = PALAVRAS_CHAVE_POR_METRICA[chave];
    if (!regra) {
      continue;
    }
    const temExcluida = regra.excluir?.some((ex) => txt.includes(ex.toLowerCase()));
    if (temExcluida) {
      continue;
    }
    const temIncluida = regra.incluir.some((inc) => txt.includes(inc.toLowerCase()));
    if (temIncluida) {
      return chave;
    }
  }

  return null;
}

/**
 * Métrica detectada nas séries retornadas pela query.
 * - `chave`: subtipo pré-configurado (quando reconhecido) ou o nome real da métrica.
 *   É a mesma chave usada pelo processador de dados para buscar o estilo individual.
 */
export interface MetricaDetectadaQuery {
  chave: string;
  rotulo: string;
  icone: string;
  subtipo: AnyDeviceMetricType | null;
}

/**
 * Detecta quais métricas estão presentes nas séries da query (sem duplicatas).
 * Métricas reconhecidas no catálogo do dispositivo usam a chave do subtipo;
 * as demais (ex.: "Número de núcleos") entram com o próprio nome como chave.
 */
export function detectarMetricasDaQuery(
  series: DataFrame[] | undefined,
  dispositivo: DeviceType
): MetricaDetectadaQuery[] {
  if (!series || series.length === 0) {
    return [];
  }

  const catalogo = obterMetricasDisponiveisParaDispositivo(dispositivo);
  const resultado = new Map<string, MetricaDetectadaQuery>();

  for (const id of identificarSeries(series)) {
    const subtipo = detectarSubTipoMetricaPorTexto(id.nomeMetrica, dispositivo);
    if (subtipo) {
      if (!resultado.has(subtipo)) {
        const itemCatalogo = catalogo.find((m) => m.value === subtipo);
        resultado.set(subtipo, {
          chave: subtipo,
          rotulo: itemCatalogo?.label || PRECONFIGURACOES_METRICAS[subtipo]?.rotulo || id.nomeMetrica,
          icone: itemCatalogo?.icone || PRECONFIGURACOES_METRICAS[subtipo]?.icone || '📊',
          subtipo,
        });
      }
      continue;
    }

    const chave = id.nomeMetrica;
    if (!resultado.has(chave)) {
      resultado.set(chave, { chave, rotulo: id.nomeMetrica, icone: '📊', subtipo: null });
    }
  }

  return Array.from(resultado.values());
}
