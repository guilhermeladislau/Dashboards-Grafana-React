import { DataFrame, Field, FieldType, getFieldDisplayName } from '@grafana/data';

/**
 * Resultado da identificação de uma série (campo de valor) retornada pela query.
 *
 * Conceito: um DISPOSITIVO (ex.: "CPU", "SRV-01") possui várias MÉTRICAS
 * (ex.: "Uso de CPU", "Número de núcleos"). Cada série da query é uma métrica
 * de algum dispositivo — nunca um dispositivo por si só.
 */
export interface IdentificacaoSerie {
  serie: DataFrame;
  campo: Field;
  /** Nome completo exibido pelo Grafana (ex.: "CPU: Uso de CPU") */
  nomeExibicaoBruto: string;
  /** Dispositivo ao qual a métrica pertence (undefined = dispositivo único do painel) */
  dispositivo?: string;
  /** Nome da métrica sem o prefixo do dispositivo (ex.: "Uso de CPU") */
  nomeMetrica: string;
}

interface AnaliseCampo {
  serie: DataFrame;
  campo: Field;
  nomeExibicaoBruto: string;
  hostRotulo?: string;
  itemRotulo?: string;
  prefixoTexto?: string;
  restoTexto?: string;
}

const normalizar = (texto: string) => texto.trim().toLowerCase();

/**
 * Prefixos de categorias/subsistemas comuns em templates do Zabbix.
 * Quando uma mesma query traz vários prefixos diferentes dessa lista
 * (ex.: "CPU: Utilization" e "Memory: Utilization"), eles são categorias de métricas
 * de um MESMO dispositivo, e não hosts/dispositivos diferentes.
 */
const PREFIXOS_CATEGORIA_METRICA = new Set([
  'cpu',
  'processor',
  'processador',
  'memory',
  'memória',
  'memoria',
  'ram',
  'swap',
  'disk',
  'disco',
  'filesystem',
  'partição',
  'particao',
  'storage',
  'datastore',
  'network',
  'rede',
  'interface',
  'net',
  'wan',
  'lan',
  'wifi',
  'wi-fi',
  'wireless',
  'system',
  'sistema',
  'status',
  'health',
  'saúde',
  'saude',
  'icmp',
  'ping',
  'zabbix',
  'zabbix agent',
  'agent',
  'snmp',
  'power',
  'energia',
  'temperature',
  'temperatura',
  'thermal',
  'fan',
  'cooling',
  'uptime',
  'service',
  'services',
  'serviço',
  'serviços',
  'servico',
  'servicos',
  'security',
  'segurança',
  'vpn',
  'ips',
  'firewall',
  'vmware',
  'linux',
  'windows',
]);

function ehPrefixoDeCategoria(prefixo: string): boolean {
  const norm = normalizar(prefixo);
  if (PREFIXOS_CATEGORIA_METRICA.has(norm)) {
    return true;
  }
  return (
    norm.startsWith('filesystem ') ||
    norm.startsWith('disk ') ||
    norm.startsWith('disco ') ||
    norm.startsWith('interface ') ||
    norm.startsWith('network ')
  );
}

/**
 * Separa "PREFIXO: Resto" ou "PREFIXO - Resto" em duas partes.
 */
function separarPrefixo(nome: string): { prefixo?: string; resto?: string } {
  for (const separador of [': ', ' - ']) {
    const pos = nome.indexOf(separador);
    if (pos > 0) {
      const prefixo = nome.slice(0, pos).trim();
      const resto = nome.slice(pos + separador.length).trim();
      if (prefixo && resto) {
        return { prefixo, resto };
      }
    }
  }
  return {};
}

function analisarCampo(serie: DataFrame, campo: Field, todasSeries: DataFrame[]): AnaliseCampo {
  const nomeExibicaoBruto =
    campo.config?.displayName || getFieldDisplayName(campo, serie, todasSeries) || campo.name;

  const hostRotulo =
    campo.labels?.host ||
    campo.labels?.hostname ||
    campo.labels?.device ||
    campo.labels?.instance ||
    campo.labels?.server ||
    campo.labels?.['host.name'];

  const itemRotulo = campo.labels?.item || campo.labels?.metric || campo.labels?.['item.name'];

  let { prefixo, resto } = separarPrefixo(nomeExibicaoBruto);

  // Quando series.name traz o prefixo e campo.name traz a métrica
  if (
    !prefixo &&
    serie.name &&
    campo.name &&
    campo.name.toLowerCase() !== 'value' &&
    serie.name !== campo.name
  ) {
    prefixo = serie.name.trim();
    resto = campo.name.trim();
  }

  return {
    serie,
    campo,
    nomeExibicaoBruto,
    hostRotulo: hostRotulo ? String(hostRotulo).trim() : undefined,
    itemRotulo: itemRotulo ? String(itemRotulo).trim() : undefined,
    prefixoTexto: prefixo,
    restoTexto: resto,
  };
}

/**
 * Lista os campos de valor (número/texto) de todas as séries.
 */
export function listarCamposValor(series: DataFrame[]): Array<{ serie: DataFrame; campo: Field }> {
  const lista: Array<{ serie: DataFrame; campo: Field }> = [];
  for (const serie of series || []) {
    for (const campo of serie.fields || []) {
      if (campo.type === FieldType.number || campo.type === FieldType.string) {
        lista.push({ serie, campo });
      }
    }
  }
  return lista;
}

/**
 * Identifica dispositivo e métrica de cada série considerando o CONJUNTO de séries:
 *
 * 1. Labels explícitos (host/hostname/device/instance/server) definem o dispositivo.
 * 2. Prefixos textuais ("X: Métrica"):
 *    - Um único prefixo em todas as séries → é o dispositivo (ex.: "CPU" com
 *      métricas "Uso de CPU" e "Número de núcleos").
 *    - Prefixos diferentes que não são categorias de subsistema e cujas métricas se repetem
 *      (ex.: "SRV-01: Uso de CPU" e "SRV-02: Uso de CPU") → cada prefixo é um dispositivo.
 *    - Prefixos diferentes de categorias de subsistema (ex.: "CPU: Utilization" e
 *      "Memory: Utilization") ou sem repetição de métrica → são métricas do MESMO dispositivo.
 * 3. Sem nenhuma informação → métrica do dispositivo único do painel.
 */
export function identificarSeries(series: DataFrame[]): IdentificacaoSerie[] {
  const analises = listarCamposValor(series).map(({ serie, campo }) =>
    analisarCampo(serie, campo, series)
  );

  // Analisa os prefixos textuais das séries sem host explícito
  const comPrefixo = analises.filter((a) => !a.hostRotulo && a.prefixoTexto);
  const metricasPorPrefixo = new Map<string, Set<string>>();
  for (const a of comPrefixo) {
    const chave = normalizar(a.prefixoTexto!);
    if (!metricasPorPrefixo.has(chave)) {
      metricasPorPrefixo.set(chave, new Set());
    }
    metricasPorPrefixo.get(chave)!.add(normalizar(a.restoTexto || ''));
  }

  let prefixosSaoDispositivos = metricasPorPrefixo.size === 1;
  if (metricasPorPrefixo.size > 1) {
    const todosPrefixos = Array.from(metricasPorPrefixo.keys());
    const algumEhCategoria = todosPrefixos.some((p) => ehPrefixoDeCategoria(p));
    if (!algumEhCategoria) {
      const contagemMetrica = new Map<string, number>();
      metricasPorPrefixo.forEach((metricas) => {
        metricas.forEach((m) => contagemMetrica.set(m, (contagemMetrica.get(m) || 0) + 1));
      });
      prefixosSaoDispositivos = Array.from(contagemMetrica.values()).some((qtd) => qtd > 1);
    } else {
      prefixosSaoDispositivos = false;
    }
  }

  return analises.map((a): IdentificacaoSerie => {
    if (a.hostRotulo) {
      const prefixoEhHost =
        a.prefixoTexto && normalizar(a.prefixoTexto) === normalizar(a.hostRotulo);
      return {
        serie: a.serie,
        campo: a.campo,
        nomeExibicaoBruto: a.nomeExibicaoBruto,
        dispositivo: a.hostRotulo,
        nomeMetrica:
          a.itemRotulo || (prefixoEhHost ? a.restoTexto! : undefined) || a.nomeExibicaoBruto,
      };
    }

    if (a.prefixoTexto) {
      if (prefixosSaoDispositivos) {
        return {
          serie: a.serie,
          campo: a.campo,
          nomeExibicaoBruto: a.nomeExibicaoBruto,
          dispositivo: a.prefixoTexto,
          nomeMetrica: a.restoTexto || a.nomeExibicaoBruto,
        };
      }
      // Quando há múltiplas categorias de métrica no mesmo dispositivo (ex.: "CPU: Utilization"
      // e "Memory: Utilization"), preserva o rótulo descritivo se o resto for genérico
      const restoGen = normalizar(a.restoTexto || '');
      const restoMuitoGenerico =
        restoGen === 'utilization' ||
        restoGen === 'utilização' ||
        restoGen === 'utilizacao' ||
        restoGen === 'usage' ||
        restoGen === 'uso' ||
        restoGen === 'status' ||
        restoGen === 'free' ||
        restoGen === 'livre' ||
        restoGen === 'used' ||
        restoGen === 'usado' ||
        restoGen === 'total';
      return {
        serie: a.serie,
        campo: a.campo,
        nomeExibicaoBruto: a.nomeExibicaoBruto,
        dispositivo: undefined,
        nomeMetrica: restoMuitoGenerico
          ? a.nomeExibicaoBruto
          : a.restoTexto || a.nomeExibicaoBruto,
      };
    }

    return {
      serie: a.serie,
      campo: a.campo,
      nomeExibicaoBruto: a.nomeExibicaoBruto,
      dispositivo: undefined,
      nomeMetrica: a.itemRotulo || a.nomeExibicaoBruto,
    };
  });
}

/**
 * Lista os nomes de dispositivos reais encontrados na query (sem duplicatas).
 */
export function extrairDispositivosDasSeries(series: DataFrame[]): string[] {
  const nomes = new Set<string>();
  for (const id of identificarSeries(series)) {
    if (id.dispositivo) {
      nomes.add(id.dispositivo);
    }
  }
  return Array.from(nomes);
}
