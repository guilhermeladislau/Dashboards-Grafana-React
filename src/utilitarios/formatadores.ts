import { StandardUnitType } from '../types';

/**
 * Formata segundos no formato legível de Uptime (ex.: 14d 6h 32m)
 */
export function formatarUptime(segundos: number): string {
  if (isNaN(segundos) || segundos < 0) {
    return '0m 0s';
  }
  const s = Math.floor(segundos);
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
export function formatarBytes(bytes: number, decimais = 1): string {
  if (isNaN(bytes) || bytes <= 0) {
    return '0 B';
  }
  const k = 1024;
  const tamanhos = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.max(0, Math.floor(Math.log(bytes) / Math.log(k)));
  const idx = Math.min(i, tamanhos.length - 1);
  return `${(bytes / Math.pow(k, idx)).toFixed(decimais)} ${tamanhos[idx]}`;
}

/**
 * Formata taxa de tráfego de rede (bps, Kbps, Mbps, Gbps)
 */
export function formatarBandaRede(bps: number, decimais = 2): string {
  if (isNaN(bps) || bps <= 0) {
    return '0 bps';
  }
  const k = 1000;
  const tamanhos = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'];
  const i = Math.max(0, Math.floor(Math.log(bps) / Math.log(k)));
  const idx = Math.min(i, tamanhos.length - 1);
  return `${(bps / Math.pow(k, idx)).toFixed(decimais)} ${tamanhos[idx]}`;
}

/**
 * Formata latência (converte segundos do Zabbix < 1 para ms caso necessário)
 */
export function formatarLatenciaMs(
  val: number,
  decimais = 1
): { ms: number; texto: string } {
  if (isNaN(val) || val < 0) {
    return { ms: 0, texto: '0.0 ms' };
  }
  const ms = val > 0 && val < 1 ? val * 1000 : val;
  return {
    ms,
    texto: `${ms.toFixed(decimais)} ms`,
  };
}

/**
 * Formata um valor numérico ou textual baseado na unidade do Standard Options
 * Se decimais for null, exibe o número original sem limitar casas decimais (ilimitado)
 */
export function formatarPorUnidadePadrao(
  valor: number | string | null,
  unidade: Exclude<StandardUnitType, 'auto'>,
  decimais: number | null = 1,
  textoSemValor = '-'
): string {
  if (valor === null || valor === undefined || valor === '') {
    return textoSemValor;
  }

  const num = typeof valor === 'number' ? valor : Number(valor);
  const ehNum = !isNaN(num);

  if (!ehNum) {
    return String(valor);
  }

  const formatarNumero = (n: number, casas: number | null): string => {
    if (casas === null) {
      return String(n);
    }
    return n.toFixed(casas);
  };

  switch (unidade) {
    case 'percent':
      return `${formatarNumero(num, decimais)}%`;
    case 'percent_unit':
      return `${formatarNumero(num * 100, decimais)}%`;
    case 'bytes':
      return formatarBytes(num, decimais ?? 2);
    case 'bps':
      return formatarBandaRede(num, decimais ?? 2);
    case 'pps':
      return `${num.toLocaleString(undefined, {
        maximumFractionDigits: decimais !== null ? decimais : 20,
      })} pps`;
    case 'reqps':
      return `${num.toLocaleString(undefined, {
        maximumFractionDigits: decimais !== null ? decimais : 20,
      })} req/s`;
    case 'iops':
      return `${num.toLocaleString(undefined, {
        maximumFractionDigits: decimais !== null ? decimais : 20,
      })} IOPS`;
    case 'ms':
      return decimais !== null
        ? formatarLatenciaMs(num, decimais).texto
        : `${num} ms`;
    case 'segundos':
      return `${formatarNumero(num, decimais)} s`;
    case 'minutos':
      return `${formatarNumero(num, decimais)} min`;
    case 'horas':
      return `${formatarNumero(num, decimais)} h`;
    case 'dias':
      return `${formatarNumero(num, decimais)} d`;
    case 'uptime':
      return formatarUptime(num);
    case 'watts':
      return `${formatarNumero(num, decimais)} W`;
    case 'kw':
      return `${formatarNumero(num, decimais)} kW`;
    case 'celsius':
      return `${formatarNumero(num, decimais)} °C`;
    case 'fahrenheit':
      return `${formatarNumero(num, decimais)} °F`;
    case 'dbm':
      return `${formatarNumero(num, decimais)} dBm`;
    case 'db':
      return `${formatarNumero(num, decimais)} dB`;
    case 'clientes':
      return `${Math.round(num)} clientes`;
    case 'status':
      return num >= 1 ? 'ONLINE' : 'OFFLINE';
    case 'status_vm':
      return num >= 1 ? 'LIGADA' : 'DESLIGADA';
    case 'status_porta':
      return num >= 1 ? 'UP (ATIVA)' : 'DOWN';
    case 'saude':
      if (num === 0 || num === 1) {
        return 'SAUDÁVEL';
      }
      if (num === 2) {
        return 'ATENÇÃO';
      }
      return 'CRÍTICO';
    case 'numero':
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimais !== null ? decimais : 20,
      });
    case 'texto':
    default:
      return String(valor);
  }
}

// Aliases para compatibilidade
export const formatUptime = formatarUptime;
export const formatBytes = formatarBytes;
export const formatBandwidth = formatarBandaRede;
export const formatLatencyMs = (val: number) => {
  const r = formatarLatenciaMs(val);
  return { ms: r.ms, text: r.texto };
};
