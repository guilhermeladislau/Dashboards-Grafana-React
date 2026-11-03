#!/usr/bin/env bash
# Build e deploy do plugin para o Grafana (Docker ou diretorio local).
#
# Uso:
#   ./atualizar-grafana.sh                         -> typecheck, build e reload
#   ./atualizar-grafana.sh --watch                 -> build + modo watch
#   ./atualizar-grafana.sh --rapido                -> pula o typecheck separado
#   ./atualizar-grafana.sh --local /caminho/plugins -> copia dist para pasta local

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PLUGIN_ID="guilhermeladislau-zabbixmonitor-panel"
CONTAINER_NAME="guilhermeladislau-zabbixmonitor-panel"
GRAFANA_URL="${GRAFANA_URL:-http://localhost:3000}"
MODO_WATCH=false
MODO_RAPIDO=false
DESTINO_LOCAL="${GRAFANA_PLUGINS_DIR:-}"

VERDE='\033[0;32m'
AZUL='\033[0;34m'
AMARELO='\033[1;33m'
VERMELHO='\033[0;31m'
NC='\033[0m'

log_info()    { echo -e "${AZUL}[info]${NC} $1"; }
log_sucesso() { echo -e "${VERDE}[ok]${NC} $1"; }
log_aviso()   { echo -e "${AMARELO}[aviso]${NC} $1"; }
log_erro()    { echo -e "${VERMELHO}[erro]${NC} $1"; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    -w|--watch)
      MODO_WATCH=true
      shift
      ;;
    -r|--rapido|--fast)
      MODO_RAPIDO=true
      shift
      ;;
    -l|--local)
      DESTINO_LOCAL="${2:-}"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

log_info "Atualizando plugin: ${PLUGIN_ID}"

if [ ! -d "node_modules" ]; then
  log_info "node_modules ausente. Executando npm install..."
  npm install
fi

if [ "$MODO_RAPIDO" = false ]; then
  log_info "Executando typecheck..."
  npm run typecheck
  log_sucesso "Tipagem validada."
fi

log_info "Gerando build em ./dist..."
npm run build
log_sucesso "Build concluido."

if [ -n "$DESTINO_LOCAL" ]; then
  PASTA_DESTINO="${DESTINO_LOCAL%/}/${PLUGIN_ID}"
  log_info "Copiando ./dist para ${PASTA_DESTINO}..."
  mkdir -p "$PASTA_DESTINO"
  cp -r dist/* "$PASTA_DESTINO/"
  log_sucesso "Arquivos copiados."
fi

if command -v docker >/dev/null 2>&1; then
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${CONTAINER_NAME}$"; then
    log_info "Reiniciando container ${CONTAINER_NAME}..."
    docker restart "$CONTAINER_NAME" >/dev/null
    log_sucesso "Container reiniciado."
  elif docker ps -a --format '{{.Names}}' 2>/dev/null | grep -q "^${CONTAINER_NAME}$"; then
    log_info "Iniciando container ${CONTAINER_NAME}..."
    docker start "$CONTAINER_NAME" >/dev/null
    log_sucesso "Container iniciado."
  else
    log_info "Subindo container com docker compose up -d..."
    docker compose up -d
    log_sucesso "Container em execucao."
  fi
else
  log_aviso "Docker nao encontrado no PATH; apenas ./dist foi atualizado."
fi

log_sucesso "Disponivel em ${GRAFANA_URL} (use Ctrl+F5 no navegador para recarregar)."

if [ "$MODO_WATCH" = true ]; then
  log_info "Iniciando modo watch (npm run dev)..."
  npm run dev
fi
