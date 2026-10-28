import React from 'react';
import { css } from '@emotion/css';
import { IconeMetrica } from './IconeMetrica';
import { TagStatus } from './TagStatus';

export interface CabecalhoBlocoProps {
  titulo: string;
  categoria: string;
  icone?: string;
  tagStatus?: string;
  corStatus?: string;
  exibirTagStatus?: boolean;
  tamanhoFonteTitulo?: string;
  corTexto?: string;
  corTextoSecundario?: string;
}

export const CabecalhoBloco: React.FC<CabecalhoBlocoProps> = ({
  titulo,
  categoria,
  icone,
  tagStatus,
  corStatus,
  exibirTagStatus = true,
  tamanhoFonteTitulo = '11px',
  corTexto,
  corTextoSecundario,
}) => {
  const estiloCabecalho = css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  `;

  const estiloCaixaTitulo = css`
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
  `;

  const estiloTitulo = css`
    font-size: ${tamanhoFonteTitulo};
    font-weight: 700;
    color: ${corTexto ? `${corTexto}dd` : corTextoSecundario || 'inherit'};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `;

  return (
    <div className={estiloCabecalho}>
      <div className={estiloCaixaTitulo}>
        <IconeMetrica icone={icone} titulo={titulo} categoria={categoria} />
        <span className={estiloTitulo} title={titulo}>
          {titulo}
        </span>
      </div>

      {exibirTagStatus && tagStatus && (
        <TagStatus tag={tagStatus} corStatus={corStatus} />
      )}
    </div>
  );
};

// Aliases para compatibilidade
export const MetricCardHeader = CabecalhoBloco;
