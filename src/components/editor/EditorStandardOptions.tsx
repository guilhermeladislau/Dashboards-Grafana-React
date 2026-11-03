import React, { useState } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Button, Field, Select, Input, Checkbox, Icon, Switch, useTheme2 } from '@grafana/ui';
import { PanelOptions, StandardOptionsGroup, StandardUnitType } from '../../types';

export const OPCOES_UNIDADES: Array<{ value: StandardUnitType; label: string }> = [
  { value: 'auto', label: '✨ Pré-configurada da Métrica (Automático)' },
  { value: 'percent', label: 'Percentual: % (0 a 100)' },
  { value: 'percent_unit', label: 'Percentual: 0.0 a 1.0 (Decimal)' },
  { value: 'bytes', label: 'Dados: Armazenamento (B, KB, MB, GB, TB)' },
  { value: 'bps', label: 'Rede: Taxa de Transferência (bps, Kbps, Mbps, Gbps)' },
  { value: 'pps', label: 'Rede: Pacotes por Segundo (pps)' },
  { value: 'reqps', label: 'Throughput: Requisições por Segundo (req/s)' },
  { value: 'iops', label: 'Disco: Operações de E/S (IOPS)' },
  { value: 'ms', label: 'Tempo: Milissegundos (ms)' },
  { value: 'segundos', label: 'Tempo: Segundos (s)' },
  { value: 'minutos', label: 'Tempo: Minutos (min)' },
  { value: 'horas', label: 'Tempo: Horas (h)' },
  { value: 'dias', label: 'Tempo: Dias (d)' },
  { value: 'uptime', label: 'Tempo: Uptime Formatado (d, h, m, s)' },
  { value: 'watts', label: 'Energia: Watts (W)' },
  { value: 'kw', label: 'Energia: Kilowatts (kW)' },
  { value: 'celsius', label: 'Temperatura: Celsius (°C)' },
  { value: 'fahrenheit', label: 'Temperatura: Fahrenheit (°F)' },
  { value: 'dbm', label: 'Sinal Wi-Fi: Potência (dBm)' },
  { value: 'db', label: 'Rádio: Ganho / Atenuação (dB)' },
  { value: 'clientes', label: 'Dispositivos: Clientes Conectados' },
  { value: 'status', label: 'Estado: Conectividade (ONLINE / OFFLINE)' },
  { value: 'status_vm', label: 'Estado: Máquina Virtual (LIGADA / DESLIGADA)' },
  { value: 'status_porta', label: 'Estado: Porta de Rede (UP / DOWN)' },
  { value: 'saude', label: 'Saúde: Hardware (SAUDÁVEL / ALERTA / CRÍTICO)' },
  { value: 'numero', label: 'Contador: Número Inteiro / Decimal' },
  { value: 'texto', label: 'Texto: Leitura Literal / String' },
];

export const EditorStandardOptions: React.FC<
  StandardEditorProps<StandardOptionsGroup, any, PanelOptions>
> = ({ value, onChange, context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const tema = useTheme2();

  const opcoesRaiz = context?.options || ({} as Partial<PanelOptions>);
  const grupo = value || {};

  const unit: StandardUnitType = grupo.unit ?? opcoesRaiz.standardUnit ?? 'auto';
  const decimalsAuto: boolean = grupo.decimalsAuto ?? opcoesRaiz.decimalsAuto ?? true;
  const customDecimals: number = grupo.customDecimals ?? opcoesRaiz.customDecimals ?? 0;
  const displayName: string = grupo.displayName ?? opcoesRaiz.standardDisplayName ?? '';
  const prefix: string = grupo.prefix ?? opcoesRaiz.standardPrefix ?? '';
  const suffix: string = grupo.suffix ?? opcoesRaiz.standardSuffix ?? '';
  const min: number = grupo.min ?? opcoesRaiz.standardMin ?? 0;
  const max: number = grupo.max ?? opcoesRaiz.standardMax ?? 100;
  const noValue: string = grupo.noValue ?? opcoesRaiz.standardNoValue ?? '-';
  const linkUrl: string = grupo.linkUrl ?? '';
  const linkTargetBlank: boolean = grupo.linkTargetBlank !== false;

  const atualizar = (parcial: Partial<StandardOptionsGroup>) => {
    onChange({
      unit,
      decimalsAuto,
      customDecimals,
      displayName,
      prefix,
      suffix,
      min,
      max,
      noValue,
      linkUrl,
      linkTargetBlank,
      ...parcial,
    });
  };

  return (
    <div
      style={{
        marginTop: 16,
        paddingTop: 4,
        borderTop: `1px solid ${tema.colors.border.weak}`,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 0',
          cursor: 'pointer',
          userSelect: 'none',
          color: isHovered ? tema.colors.text.maxContrast : tema.colors.text.primary,
          transition: 'color 0.15s ease',
        }}
      >
        <span
          style={{
            fontWeight: tema.typography.fontWeightMedium,
            fontSize: tema.typography.fontSize,
          }}
        >
          Standard options
        </span>
        <Icon
          name={isOpen ? 'angle-up' : 'angle-down'}
          style={{
            color: tema.colors.text.secondary,
            fontSize: 16,
          }}
        />
      </div>

      {isOpen && (
        <div style={{ paddingTop: 8, paddingBottom: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* 1. Unidade da Métrica */}
          <Field
            label="Unidade da Métrica (Unit)"
            description="Formatação da unidade de leitura. Já vem pré-configurada pelo dispositivo, mas você pode sobrescrever livremente."
          >
            <Select
              options={OPCOES_UNIDADES}
              value={unit}
              onChange={(opt) => atualizar({ unit: (opt.value as StandardUnitType) || 'auto' })}
            />
          </Field>

          {/* 2. Casas Decimais com caixinha Auto e campo manual */}
          <Field
            label="Casas Decimais (Decimals)"
            description="Se o campo Auto estiver marcado, o campo de inserir fica indisponível. Se estiver com 0 ou nada escrito, o número é ilimitado."
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Checkbox
                label="Auto"
                value={decimalsAuto}
                onChange={(e) => atualizar({ decimalsAuto: e.currentTarget.checked })}
              />
              <div style={{ flex: 1 }}>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  step={1}
                  placeholder={decimalsAuto ? 'Automático' : '0 = Ilimitado'}
                  disabled={decimalsAuto}
                  value={decimalsAuto ? '' : customDecimals === 0 ? '' : customDecimals}
                  onChange={(e) => {
                    const texto = e.currentTarget.value;
                    atualizar({ customDecimals: texto === '' ? 0 : Number(texto) });
                  }}
                />
              </div>
            </div>
          </Field>

          {/* 3. Nome de Exibição */}
          <Field
            label="Nome de Exibição (Display Name)"
            description="Sobrescreve o título da métrica. Suporta variáveis do dashboard (ex: $host, $device)."
          >
            <Input
              value={displayName}
              placeholder="Nome padrão da métrica"
              onChange={(e) => atualizar({ displayName: e.currentTarget.value })}
            />
          </Field>

          {/* 4. Prefixo e Sufixo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Prefixo (Prefix)" description="ex.: R$, >, ~">
              <Input
                value={prefix}
                placeholder="Prefixo"
                onChange={(e) => atualizar({ prefix: e.currentTarget.value })}
              />
            </Field>
            <Field label="Sufixo (Suffix)" description="ex.: /s, total">
              <Input
                value={suffix}
                placeholder="Sufixo"
                onChange={(e) => atualizar({ suffix: e.currentTarget.value })}
              />
            </Field>
          </div>

          {/* 5. Mínimo e Máximo da Escala */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Mínimo da Escala (Min)" description="Limite inferior proporcional">
              <Input
                type="number"
                value={min}
                onChange={(e) => atualizar({ min: Number(e.currentTarget.value) })}
              />
            </Field>
            <Field label="Máximo da Escala (Max)" description="Limite superior proporcional">
              <Input
                type="number"
                value={max}
                onChange={(e) => atualizar({ max: Number(e.currentTarget.value) })}
              />
            </Field>
          </div>

          {/* 6. Texto Sem Leitura */}
          <Field
            label="Texto Sem Leitura (No Value)"
            description="Texto exibido quando a query não retorna leitura válida ou está vazia."
          >
            <Input
              value={noValue}
              placeholder="-"
              onChange={(e) => atualizar({ noValue: e.currentTarget.value })}
            />
          </Field>

          {/* 7. Link de Redirecionamento Global */}
          <Field
            label="🔗 Link Padrão da Métrica (URL)"
            description="Torna o quadradinho da métrica clicável (suporta ${host}, ${deviceName}, etc.)"
          >
            <Input
              value={linkUrl}
              placeholder="Ex: https://... ou /d/... com ${host}"
              onChange={(e) => atualizar({ linkUrl: e.currentTarget.value })}
            />
          </Field>

          <Field label="Abrir Link em Nova Aba">
            <Switch
              value={linkTargetBlank}
              onChange={(e) => atualizar({ linkTargetBlank: e.currentTarget.checked })}
            />
          </Field>

          {(unit !== 'auto' ||
            !decimalsAuto ||
            displayName.trim() !== '' ||
            prefix !== '' ||
            suffix !== '' ||
            min !== 0 ||
            max !== 100 ||
            (noValue !== '-' && noValue !== '') ||
            (linkUrl && linkUrl.trim() !== '')) && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              fill="outline"
              icon="history"
              style={{ alignSelf: 'flex-start' }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange({
                  unit: 'auto',
                  decimalsAuto: true,
                  customDecimals: 0,
                  displayName: '',
                  prefix: '',
                  suffix: '',
                  min: 0,
                  max: 100,
                  noValue: '-',
                  linkUrl: '',
                  linkTargetBlank: true,
                });
              }}
            >
              Restaurar padrão (Standard options)
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
