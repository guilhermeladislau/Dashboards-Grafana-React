import React, { useState } from 'react';
import { Icon, useTheme2 } from '@grafana/ui';

export interface GavetaRetratilProps {
  titulo: string;
  subtitulo?: string;
  aberta?: boolean;
  abertaInicial?: boolean;
  aoAlternar?: () => void;
  children: React.ReactNode;
}

export const GavetaRetratil: React.FC<GavetaRetratilProps> = ({
  titulo,
  subtitulo,
  aberta: abertaControlada,
  abertaInicial = false,
  aoAlternar,
  children,
}) => {
  const [abertaInterna, setAbertaInterna] = useState(abertaInicial);
  const [isHovered, setIsHovered] = useState(false);
  const tema = useTheme2();

  const estaAberta = abertaControlada !== undefined ? abertaControlada : abertaInterna;

  const alternar = () => {
    if (aoAlternar) {
      aoAlternar();
    } else {
      setAbertaInterna((prev) => !prev);
    }
  };

  return (
    <div
      style={{
        marginTop: 14,
        paddingTop: 4,
        borderTop: `1px solid ${tema.colors.border.weak}`,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={alternar}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            alternar();
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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontWeight: tema.typography.fontWeightMedium,
              fontSize: tema.typography.fontSize,
            }}
          >
            {titulo}
          </span>
          {subtitulo && (
            <span style={{ fontSize: 11, color: tema.colors.text.secondary, marginTop: 2 }}>
              {subtitulo}
            </span>
          )}
        </div>
        <Icon
          name={estaAberta ? 'angle-up' : 'angle-down'}
          style={{
            color: tema.colors.text.secondary,
            fontSize: 16,
          }}
        />
      </div>

      {estaAberta && (
        <div
          style={{
            paddingTop: 8,
            paddingBottom: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};
