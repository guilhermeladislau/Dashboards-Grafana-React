#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ID="guilhermeladislau-zabbixmonitor-panel"
DIST_DIR="${SCRIPT_DIR}/dist"
TARGET_DIR="/var/lib/grafana/plugins/${PLUGIN_ID}"

echo "[info] Atualizando o plugin em ${TARGET_DIR}..."
rm -rf "${TARGET_DIR}"
mkdir -p "${TARGET_DIR}"
cp -r "${DIST_DIR}"/* "${TARGET_DIR}/"

# Adiciona timestamp na versao para forcar recarregamento de cache no navegador
BUILD_TS=$(date +%H%M%S)
sed -i -E "s/\"version\": \"[^\"]+\"/\"version\": \"1.0.0-${BUILD_TS}\"/g" "${TARGET_DIR}/plugin.json"

chown -R grafana:grafana "${TARGET_DIR}"
chmod -R 755 "${TARGET_DIR}"
echo "[ok] Arquivos copiados (versao 1.0.0-${BUILD_TS}) e permissoes aplicadas."

echo "[info] Reiniciando grafana-server..."
systemctl restart grafana-server
echo "[ok] Servico reiniciado."

echo "[info] Ultimas linhas do log do Grafana:"
sleep 2
journalctl -u grafana-server -n 30 --no-pager | grep -iE "${PLUGIN_ID}|plugin registered" | tail -n 10 || true
