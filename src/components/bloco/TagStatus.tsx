import React from 'react';
import { css } from '@emotion/css';

export interface TagStatusProps {
  tag?: string;
  corStatus?: string;
}

export const TagStatus: React.FC<TagStatusProps> = ({ tag, corStatus }) => {
  if (!tag) {
    return null;
  }

  const estiloTag = css`
    font-size: 9px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 12px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    background: ${corStatus ? `${corStatus}22` : 'rgba(99, 102, 241, 0.15)'};
    color: ${corStatus || '#818cf8'};
    border: 1px solid ${corStatus ? `${corStatus}66` : 'rgba(99, 102, 241, 0.4)'};
    flex-shrink: 0;
  `;

  return <span className={estiloTag}>{tag}</span>;
};

// Aliases para compatibilidade
export const MetricStatusBadge = TagStatus;
