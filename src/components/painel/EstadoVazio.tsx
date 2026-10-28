import React from 'react';
import { css } from '@emotion/css';

export interface EstadoVazioProps {
  mensagem?: string;
}

const estiloEstadoVazio = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 14px;
  color: #888;
`;

export const EstadoVazio: React.FC<EstadoVazioProps> = ({
  mensagem = 'Nenhuma métrica encontrada nas queries fornecidas.',
}) => {
  return <div className={estiloEstadoVazio}>{mensagem}</div>;
};

// Aliases para compatibilidade
export const EmptyState = EstadoVazio;
