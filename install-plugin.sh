#!/usr/bin/env bash
set -e

PLUGIN_ID="arxcyber-dashboardcustomizadoreact-panel"
DIST_DIR="/mnt/c/Dev/grafanaDashboards/arxcyber-dashboardcustomizadoreact-panel/dist"
TARGET_DIR="/var/lib/grafana/plugins/${PLUGIN_ID}"

echo "📦 1. Atualizando o plugin em ${TARGET_DIR}..."
rm -rf "${TARGET_DIR}"
mkdir -p "${TARGET_DIR}"
cp -r "${DIST_DIR}"/* "${TARGET_DIR}/"

# Cache-busting automático: adiciona timestamp na versão do plugin instalado
BUILD_TS=$(date +%H%M%S)
sed -i -E "s/\"version\": \"[^\"]+\"/\"version\": \"1.0.0-${BUILD_TS}\"/g" "${TARGET_DIR}/plugin.json"

chown -R grafana:grafana "${TARGET_DIR}"
chmod -R 755 "${TARGET_DIR}"
echo "   ✅ Arquivos copiados (versão 1.0.0-${BUILD_TS}) e permissões definidas."

echo "🔄 2. Reiniciando o serviço do Grafana..."
systemctl restart grafana-server
echo "   ✅ Grafana reiniciado com sucesso."

echo "🎉 Verificando logs do carregamento do plugin:"
sleep 2
journalctl -u grafana-server -n 30 --no-pager | grep -iE "arxcyber|plugin registered" | tail -n 10 || true
