import { FieldType, LoadingState, toDataFrame } from '@grafana/data';
import { extrairMetricasDosDados } from './processadorDados';
import { detectarMetricasDaQuery } from './preconfiguracoesDispositivos';
import { extrairDispositivosDasSeries, identificarSeries } from './identificacaoSeries';
import { interpretarLimiteExibicao } from '../components/grade/GradeMetricas';

describe('Separação entre Dispositivo e Métricas e Detecção Automática', () => {
  it('trata "CPU: Uso de CPU" e "CPU: Número de núcleos" como 2 métricas de 1 único dispositivo ("CPU")', () => {
    const series = [
      toDataFrame({
        refId: 'A',
        fields: [
          { name: 'Time', type: FieldType.time, values: [1000, 2000] },
          {
            name: 'CPU: Uso de CPU',
            type: FieldType.number,
            values: [42, 48.5],
          },
        ],
      }),
      toDataFrame({
        refId: 'B',
        fields: [
          { name: 'Time', type: FieldType.time, values: [1000, 2000] },
          {
            name: 'CPU: Número de núcleos',
            type: FieldType.number,
            values: [8, 8],
          },
        ],
      }),
    ];

    const identificadas = identificarSeries(series);
    expect(identificadas).toHaveLength(2);
    expect(identificadas[0].dispositivo).toBe('CPU');
    expect(identificadas[0].nomeMetrica).toBe('Uso de CPU');
    expect(identificadas[1].dispositivo).toBe('CPU');
    expect(identificadas[1].nomeMetrica).toBe('Número de núcleos');

    const dispositivosUnicos = extrairDispositivosDasSeries(series);
    expect(dispositivosUnicos).toEqual(['CPU']);

    const detectadas = detectarMetricasDaQuery(series, 'servidor');
    expect(detectadas).toHaveLength(2);
    expect(detectadas[0].chave).toBe('srv_cpu_uso');
    expect(detectadas[1].chave).toBe('Número de núcleos');
    expect(detectadas[1].subtipo).toBeNull();

    const itens = extrairMetricasDosDados(
      {
        series,
        state: LoadingState.Done,
        timeRange: {} as any,
      },
      {
        deviceType: 'servidor',
        cardDisplayMode: 'individual',
        overrideCardTitleWithPreset: true,
        selectedMetrics: [],
      } as any
    );

    expect(itens).toHaveLength(2);
    // Mesmo dispositivo ("CPU") para ambas as métricas
    expect(itens[0].deviceName).toBe('CPU');
    expect(itens[1].deviceName).toBe('CPU');

    // Primeira métrica: Uso de CPU (%)
    expect(itens[0].displayValue).toBe('48.5%');
    // Segunda métrica: Número de núcleos (valor inteiro, nunca convertido para % de CPU)
    expect(itens[1].title).toBe('Número de núcleos');
    expect(itens[1].displayValue).toBe('8');
  });

  it('não trata categorias de subsistema ("CPU: Utilization" e "Memory: Utilization") como dispositivos diferentes', () => {
    const series = [
      toDataFrame({
        refId: 'A',
        fields: [{ name: 'CPU: Utilization', type: FieldType.number, values: [35] }],
      }),
      toDataFrame({
        refId: 'B',
        fields: [{ name: 'Memory: Utilization', type: FieldType.number, values: [72] }],
      }),
    ];

    const dispositivos = extrairDispositivosDasSeries(series);
    expect(dispositivos).toEqual([]);

    const identificadas = identificarSeries(series);
    expect(identificadas[0].dispositivo).toBeUndefined();
    expect(identificadas[0].nomeMetrica).toBe('CPU: Utilization');
    expect(identificadas[1].dispositivo).toBeUndefined();
    expect(identificadas[1].nomeMetrica).toBe('Memory: Utilization');
  });

  it('identifica múltiplos dispositivos reais quando hosts distintos monitoram as mesmas métricas', () => {
    const series = [
      toDataFrame({
        refId: 'A',
        fields: [{ name: 'SRV-AD-01: Uso de CPU', type: FieldType.number, values: [25] }],
      }),
      toDataFrame({
        refId: 'B',
        fields: [{ name: 'SRV-SQL-02: Uso de CPU', type: FieldType.number, values: [65] }],
      }),
    ];

    const dispositivos = extrairDispositivosDasSeries(series);
    expect(dispositivos).toEqual(['SRV-AD-01', 'SRV-SQL-02']);
  });

  it('interpreta corretamente o campo de texto de limite (maxDevices)', () => {
    expect(interpretarLimiteExibicao('')).toBe(0);
    expect(interpretarLimiteExibicao('0')).toBe(0);
    expect(interpretarLimiteExibicao(0)).toBe(0);
    expect(interpretarLimiteExibicao('5')).toBe(5);
    expect(interpretarLimiteExibicao(' 12 ')).toBe(12);
    expect(interpretarLimiteExibicao('-3')).toBe(0);
    expect(interpretarLimiteExibicao('abc')).toBe(0);
  });
});
