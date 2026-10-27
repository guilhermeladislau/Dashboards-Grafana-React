import React, { useMemo } from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2, useTheme2 } from '@grafana/ui';
import { MetricBlockItem, PanelOptions } from '../types';

interface MetricCardProps {
  item: MetricBlockItem;
  options: PanelOptions;
}

const getMetricIcon = (title: string, category: string): string => {
  const t = title.toLowerCase();
  if (t.includes('cpu') || t.includes('processador')) {
    return '📈';
  }
  if (t.includes('memory') || t.includes('memória') || t.includes('ram')) {
    return '🧠';
  }
  if (t.includes('disk') || t.includes('disco') || t.includes('datastore') || t.includes('volume')) {
    return '💿';
  }
  if (t.includes('agent')) {
    return '🛡️';
  }
  if (t.includes('ping') || t.includes('icmp')) {
    return '🌐';
  }
  if (t.includes('uptime')) {
    return '⏱️';
  }
  if (t.includes('host') || t.includes('nome')) {
    return '🏷️';
  }
  if (t.includes('vm') || t.includes('guest') || t.includes('máquina')) {
    return '📦';
  }
  if (t.includes('traffic') || t.includes('tráfego') || t.includes('in') || t.includes('out') || t.includes('byte')) {
    return '⚡';
  }
  if (category === 'status') {
    return '📡';
  }
  return '📊';
};

const getStyles = (theme: GrafanaTheme2, options: PanelOptions, item: MetricBlockItem) => {
  const fontMap = {
    default: 'inherit',
    Inter: '"Inter", sans-serif',
    Roboto: '"Roboto", sans-serif',
    'Open Sans': '"Open Sans", sans-serif',
    Montserrat: '"Montserrat", sans-serif',
    monospace: 'monospace',
  };

  const sizeMap = {
    sm: { title: '10px', value: '20px', padding: '10px 12px' },
    md: { title: '11px', value: '26px', padding: '12px 16px' },
    lg: { title: '13px', value: '32px', padding: '16px 20px' },
    xl: { title: '15px', value: '38px', padding: '20px 24px' },
  };

  const currentSize = sizeMap[options.fontSize || 'md'] || sizeMap.md;
  const fontFamily = fontMap[options.fontFamily || 'default'] || 'inherit';

  const defaultBg =
    theme.isDark
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';

  const defaultBorder =
    theme.isDark ? 'rgba(99, 102, 241, 0.35)' : 'rgba(99, 102, 241, 0.2)';

  return {
    card: css`
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: ${options.cardBackgroundColor || defaultBg};
      color: ${options.textColor || (theme.isDark ? '#f8fafc' : '#0f172a')};
      border: 1px solid ${options.borderColor || defaultBorder};
      border-radius: 14px;
      padding: ${currentSize.padding};
      font-family: ${fontFamily};
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
      transition: all 0.25s ease-in-out;
      overflow: hidden;
      min-height: 120px;
      position: relative;

      &:hover {
        border-color: ${item.statusColor || '#818cf8'};
        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
        transform: translateY(-2px);
      }
    `,
    header: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    `,
    titleBox: css`
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
    `,
    iconBox: css`
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    `,
    title: css`
      font-size: ${currentSize.title};
      font-weight: 700;
      color: ${options.textColor ? `${options.textColor}dd` : theme.colors.text.secondary};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `,
    badge: css`
      font-size: 9px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 12px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      background: ${item.statusColor ? `${item.statusColor}22` : 'rgba(99, 102, 241, 0.15)'};
      color: ${item.statusColor || '#818cf8'};
      border: 1px solid ${item.statusColor ? `${item.statusColor}66` : 'rgba(99, 102, 241, 0.4)'};
      flex-shrink: 0;
    `,
    body: css`
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin: 4px 0 8px 0;
    `,
    valueText: css`
      font-size: ${currentSize.value};
      font-weight: 800;
      line-height: 1.1;
      color: ${item.statusLevel === 'critical' || item.statusLevel === 'offline'
        ? item.statusColor
        : options.textColor || (theme.isDark ? '#ffffff' : '#0f172a')};
      letter-spacing: -0.02em;
    `,
    progressTrack: css`
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 6px;
    `,
    progressBar: css`
      height: 100%;
      border-radius: 4px;
      transition: width 0.4s ease-in-out;
      background: ${item.statusColor || '#22c55e'};
    `,
    sparklineWrapper: css`
      width: 100%;
      height: 24px;
      margin-top: 4px;
      margin-bottom: 6px;
    `,
    sparklineSvg: css`
      width: 100%;
      height: 100%;
      overflow: visible;
    `,
    footer: css`
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.07);
      padding-top: 6px;
      font-size: 10px;
    `,
    footerSubtext: css`
      color: ${item.statusColor || theme.colors.text.secondary};
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `,
  };
};

export const MetricCard: React.FC<MetricCardProps> = ({ item, options }) => {
  const theme = useTheme2();
  const styles = useStyles2((t) => getStyles(t, options, item));
  const icon = item.icon || getMetricIcon(item.title, item.category);

  // Sparkline de tendência histórica
  const sparklinePoints = useMemo(() => {
    if (!options.showSparkline || item.points.length < 2) {
      return '';
    }

    const numericPoints = item.points
      .map((p) => (typeof p.value === 'number' ? p.value : null))
      .filter((v): v is number => v !== null);

    if (numericPoints.length < 2) {
      return '';
    }

    const min = Math.min(...numericPoints);
    const max = Math.max(...numericPoints);
    const range = max - min || 1;
    const width = 100;
    const height = 20;

    return numericPoints
      .map((val, idx) => {
        const x = (idx / (numericPoints.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [item.points, options.showSparkline]);

  const sparklineStroke =
    options.sparklineColor || item.statusColor || theme.colors.primary.main;

  return (
    <div className={styles.card}>
      {/* Cabeçalho do Card */}
      <div className={styles.header}>
        <div className={styles.titleBox}>
          <div className={styles.iconBox}>{icon}</div>
          <span className={styles.title} title={item.title}>
            {item.title}
          </span>
        </div>

        {options.showStatusBadge !== false && item.statusBadge && (
          <span className={styles.badge}>{item.statusBadge}</span>
        )}
      </div>

      {/* Valor Principal */}
      <div className={styles.body}>
        <span className={styles.valueText}>{item.displayValue}</span>
      </div>

      {/* Barra de Progresso para Métricas Percentuais */}
      {options.showProgressBar !== false && item.percentage !== undefined && (
        <div className={styles.progressTrack}>
          <div
            className={styles.progressBar}
            style={{
              width: `${item.percentage}%`,
              background:
                item.statusLevel === 'critical'
                  ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                  : item.statusLevel === 'warning'
                  ? 'linear-gradient(90deg, #6366f1, #f59e0b)'
                  : 'linear-gradient(90deg, #6366f1, #22c55e)',
            }}
          />
        </div>
      )}

      {/* Gráfico de Linha de Tendência */}
      {options.showSparkline && sparklinePoints && item.percentage === undefined && (
        <div className={styles.sparklineWrapper}>
          <svg className={styles.sparklineSvg} viewBox="0 0 100 20" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke={sparklineStroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparklinePoints}
            />
          </svg>
        </div>
      )}

      {/* Rodapé informativo */}
      {item.subText && (
        <div className={styles.footer}>
          <span className={styles.footerSubtext}>{item.subText}</span>
        </div>
      )}
    </div>
  );
};
