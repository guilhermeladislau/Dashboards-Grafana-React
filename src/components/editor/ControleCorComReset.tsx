import React from 'react';
import { Field, ColorPicker, Button, useTheme2 } from '@grafana/ui';

export interface ControleCorComResetProps {
  label: string;
  description?: string;
  valor?: string;
  corPadrao: string;
  rotuloPadrao: string;
  onChange: (novaCor: string) => void;
  onReset: () => void;
}

export const ControleCorComReset: React.FC<ControleCorComResetProps> = ({
  label,
  description,
  valor,
  corPadrao,
  rotuloPadrao,
  onChange,
  onReset,
}) => {
  const tema = useTheme2();
  const temValorCustomizado = Boolean(valor && valor.trim() !== '');

  return (
    <Field label={label} description={description}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          background: tema.colors.background.secondary,
          padding: '8px 12px',
          borderRadius: 4,
          border: `1px solid ${
            temValorCustomizado ? tema.colors.primary.border : tema.colors.border.weak
          }`,
          transition: 'border-color 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
          <ColorPicker
            color={temValorCustomizado ? valor! : corPadrao}
            onChange={(novaCor) => onChange(novaCor)}
          />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span
              style={{
                fontSize: 12,
                fontFamily: temValorCustomizado ? 'monospace' : 'inherit',
                color: temValorCustomizado
                  ? tema.colors.text.maxContrast
                  : tema.colors.text.secondary,
                fontWeight: temValorCustomizado ? tema.typography.fontWeightBold : 400,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {temValorCustomizado ? valor : rotuloPadrao}
            </span>
            {temValorCustomizado && (
              <span
                style={{
                  fontSize: 10,
                  color: tema.colors.primary.text,
                  fontWeight: tema.typography.fontWeightMedium,
                }}
              >
                Cor personalizada ativa
              </span>
            )}
          </div>
        </div>

        {temValorCustomizado ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            fill="outline"
            icon="history"
            title="Voltar à cor padrão que estava"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onReset();
            }}
          >
            Voltar ao padrão
          </Button>
        ) : (
          <span
            style={{
              fontSize: 11,
              color: tema.colors.text.disabled,
              fontStyle: 'italic',
              userSelect: 'none',
            }}
          >
            Padrão
          </span>
        )}
      </div>
    </Field>
  );
};
