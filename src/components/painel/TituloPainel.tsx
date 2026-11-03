import React, { useMemo } from 'react';
import { css } from '@emotion/css';

export interface TituloPainelProps {
  titulo?: string;
  corTexto?: string;
  substituirVariaveis?: (str: string) => string;
}

export const TituloPainel: React.FC<TituloPainelProps> = ({
  titulo,
  corTexto,
  substituirVariaveis,
}) => {
  const tituloResolvido = useMemo(() => {
    if (!titulo) {
      return '';
    }
    return substituirVariaveis ? substituirVariaveis(titulo) : titulo;
  }, [titulo, substituirVariaveis]);

  if (!tituloResolvido) {
    return null;
  }

  const estiloTitulo = css`
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: ${corTexto || 'inherit'};
  `;

  return <div className={estiloTitulo}>{tituloResolvido}</div>;
};

// Aliases para compatibilidade
export const PanelTitle = TituloPainel;
