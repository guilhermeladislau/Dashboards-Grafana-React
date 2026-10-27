#!/usr/bin/env bash
set -e

PLUGIN_ID="arxcyber-dashboardcustomizadoreact-panel"
DIST_DIR="/home/guiwtf/Programação/Dashboards-Grafana-React/dist"
TARGET_DIR="/var/lib/grafana/plugins/${PLUGIN_ID}"
CONFIG_FILE="/etc/grafana.ini"

if [ "$EUID" -ne 0 ]; then
  echo "❌ Este script precisa ser executado com permissões de administrador (sudo)."
  echo "👉 Execute: sudo bash install-plugin.sh"
  exit 1
fi

echo "📦 1. Atualizando o plugin em ${TARGET_DIR}..."
if [ -d "${TARGET_DIR}" ]; then
  rm -rf "${TARGET_DIR}"
fi

mkdir -p "${TARGET_DIR}"
cp -r "${DIST_DIR}"/* "${TARGET_DIR}/"

# Cache-busting automático: adiciona timestamp na versão do plugin instalado
# Isso força o navegador a baixar o novo module.js imediatamente sem guardar cache antigo de 1h
BUILD_TS=$(date +%H%M%S)
sed -i "s/\"version\": \"1.0.0\"/\"version\": \"1.0.0-${BUILD_TS}\"/g" "${TARGET_DIR}/plugin.json"

chown -R grafana:grafana "${TARGET_DIR}"
chmod -R 755 "${TARGET_DIR}"
echo "   ✅ Arquivos copiados (versão 1.0.0-${BUILD_TS} anti-cache) e permissões definidas."

echo "⚙️ 2. Configurando liberação de plugin não assinado..."
python3 -c "
import re

ini_path = '${CONFIG_FILE}'
plugin_id = '${PLUGIN_ID}'

try:
    with open(ini_path, 'r') as f:
        text = f.read()

    if re.search(r'^\s*allow_loading_unsigned_plugins\s*=.*' + re.escape(plugin_id), text, re.MULTILINE):
        print('   ℹ️ Plugin já estava configurado em ' + ini_path)
    elif re.search(r'^\s*allow_loading_unsigned_plugins\s*=', text, re.MULTILINE):
        text = re.sub(r'^(\s*allow_loading_unsigned_plugins\s*=\s*)(.*)$', r'\1' + plugin_id + r', \2', text, flags=re.MULTILINE)
        with open(ini_path, 'w') as f:
            f.write(text)
        print('   ✅ Adicionado à lista existente no grafana.ini')
    elif re.search(r'^\s*[;#]\s*allow_loading_unsigned_plugins\s*=', text, re.MULTILINE):
        text = re.sub(r'^\s*[;#]\s*allow_loading_unsigned_plugins\s*=.*$', 'allow_loading_unsigned_plugins = ' + plugin_id, text, flags=re.MULTILINE)
        with open(ini_path, 'w') as f:
            f.write(text)
        print('   ✅ Linha allow_loading_unsigned_plugins descomentada e ativada no grafana.ini')
    else:
        text = re.sub(r'(\[plugins\])', r'\1\nallow_loading_unsigned_plugins = ' + plugin_id, text, flags=re.IGNORECASE)
        with open(ini_path, 'w') as f:
            f.write(text)
        print('   ✅ Inserido allow_loading_unsigned_plugins na seção [plugins]')
except Exception as e:
    print('   ⚠️ Erro ao atualizar grafana.ini:', e)
"

# Configuração via Systemd Override (Garantia absoluta de carregamento do unsigned plugin)
echo "⚙️ 3. Aplicando variável de ambiente no serviço Grafana..."
mkdir -p /etc/systemd/system/grafana.service.d/
cat << 'EOF' > /etc/systemd/system/grafana.service.d/override.conf
[Service]
Environment="GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=arxcyber-dashboardcustomizadoreact-panel"
EOF
systemctl daemon-reload
echo "   ✅ Systemd configurado com GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS."

echo "🔄 4. Reiniciando o serviço do Grafana..."
systemctl restart grafana
echo "   ✅ Grafana reiniciado com sucesso."

echo ""
echo "🎉 Verificando logs do carregamento do plugin:"
sleep 2
journalctl -u grafana -n 30 --no-pager | grep -iE "arxcyber|plugin registered" | tail -n 10 || true
