import React from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Checkbox, Field, Input, useTheme2 } from '@grafana/ui';
import { MultiDevicesConfig, PanelOptions } from '../../types';

/**
 * Editor "Vários Dispositivos no Mesmo Card":
 * - Caixa de seleção que habilita o modo
 * - Campo de quantidade de dispositivos (desbloqueado somente quando a caixa está marcada)
 * A métrica monitorada (apenas 1 tipo para todos) é escolhida logo abaixo, no seletor "O que Monitorar no ...".
 */
export const EditorMultiplosDispositivos: React.FC<
  StandardEditorProps<MultiDevicesConfig, any, PanelOptions>
> = ({ value, onChange, context }) => {
  const tema = useTheme2();
  const opcoes = context?.options || ({} as Partial<PanelOptions>);
  const habilitado = Boolean(value?.enabled);
  const quantidade = value?.count;

  const atualizar = (parcial: Partial<MultiDevicesConfig>) => {
    onChange({ enabled: habilitado, count: quantidade, ...parcial });
  };

  const aoAlterarQuantidade = (texto: string) => {
    const limpo = texto.replace(/\D/g, '');
    atualizar({ count: limpo === '' ? undefined : Number(limpo) });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Checkbox
        value={habilitado}
        label="Monitorar vários dispositivos no mesmo card"
        description="Exibe a mesma métrica (ex: Uso de CPU) de vários dispositivos, individualmente, em um único card"
        onChange={(e) => atualizar({ enabled: e.currentTarget.checked })}
      />

      <Field
        label="Quantidade de dispositivos"
        description="0 ou vazio = todos os dispositivos retornados pela query"
        disabled={!habilitado}
        style={{ marginBottom: 0 }}
      >
        <Input
          type="number"
          min={0}
          width={20}
          disabled={!habilitado}
          value={quantidade ?? ''}
          placeholder="Ex: 10"
          onChange={(e) => aoAlterarQuantidade(e.currentTarget.value)}
        />
      </Field>

      {habilitado && (
        <div style={{ fontSize: 11, color: tema.colors.text.secondary, lineHeight: 1.35 }}>
          💡 Selecione logo abaixo <strong>qual métrica</strong> será monitorada em todos os dispositivos
          (apenas 1 tipo).
          {opcoes.cardDisplayMode === 'consolidado' &&
            ' A seleção de várias métricas fica desativada enquanto esta opção estiver marcada.'}
        </div>
      )}
    </div>
  );
};
