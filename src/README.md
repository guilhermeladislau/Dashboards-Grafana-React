# Zabbix Infra Monitor Panel

Zabbix Infra Monitor Panel (`guilhermeladislau-zabbixmonitor-panel`) is a Grafana panel plugin built with React and TypeScript for monitoring IT infrastructure collected by Zabbix (`alexanderzobnin-zabbix-app`).

## Features

- Dedicated card layouts for 7 device categories: Firewall, Virtual Machine (VM), Proxy, Host/Hypervisor, Server (Windows/Linux), Access Point (Wi-Fi), and Network Port/Switch.
- 9 built-in visualizations: horizontal bar, 360° circular gauge, 180° semi-gauge arc, ring/donut, vertical tower, gradient area, sparkline, bullet meter, and vertical thermometer.
- Three layout modes: one card per device (grouping all metrics of that device), all metrics and devices consolidated into a single card, or one card per metric.
- Automatic extraction of host and metric names from Zabbix series labels and naming patterns (`Host: Item`, `Host - Item`).
- Per-metric style overrides, normal/inverted/fixed thresholds, unit formatting, and custom drill-down links per block.

## Requirements

- Grafana `>= 13.2.0`
- Zabbix data source (`alexanderzobnin-zabbix-app`) or Grafana's built-in `TestData` data source for testing.

## Quick start

1. Add a new panel to your dashboard and select **Zabbix Infra Monitor Panel** as the visualization.
2. Configure your Zabbix query in the data source tab.
3. In the panel options under **Dispositivo e Monitoramento**, select the device type (or leave it on automatic detection) and pick which metrics to display.
4. Adjust thresholds, chart type, colors, and block sizing under **Estilização Visual**.
