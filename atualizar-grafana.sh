#!/usr/bin/env bash
# ==============================================================================
# Script de Build e Deploy Automático do Plugin para o Grafana
# Plugin: arxcyber-dashboardcustomizadoreact-panel
#
# Uso:
#   ./atualizar-grafana.sh            -> Valida, compila (build) e atualiza o Grafana
#   ./atualizar-grafana.sh --watch    -> Compila e fica em modo watch (auto-reload a cada salvar)
#   ./atualizar-grafana.sh --rapido   -> Pula o typecheck separado e faz direto o build + reload
#   ./atualizar-grafana.sh --local /caminho/plugins -> Copia o dist para uma instalação local
# ==============================================================================

set -euo pipefail

# Garante execução a partir da raiz do projeto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PLUGIN_ID="arxcyber-dashboardcustomizadoreact-panel"
CONTAINER_NAME="arxcyber-dashboardcustomizadoreact-panel"
GRAFANA_URL="${GRAFANA_URL:-http://localhost:3000}"
MODO_WATCH=false
MODO_RAPIDO=false
DESTINO_LOCAL="${GRAFANA_PLUGINS_DIR:-}"

# Cores para o terminal
VERDE='\033[0;32m'
AZUL='\033[0;34m'
AMARELO='\033[1;33m'
VERMELHO='\033[0;31m'
NC='\033[0m'

log_info()    { echo -e "${AZUL}ℹ️  $1${NC}"; }
log_sucesso() { echo -e "${VERDE}✅ $1${NC}"; }
log_aviso()   { echo -e "${AMARELO}⚠️  $1${NC}"; }
log_erro()    { echo -e "${VERMELHO}❌ $1${NC}"; }

# Leitura de argumentos
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

echo -e "${AZUL}==============================================================${NC}"
echo -e "${AZUL}🚀 Atualizando Plugin no Grafana: ${PLUGIN_ID}${NC}"
echo -e "${AZUL}==============================================================${NC}"

# 1. Verifica dependências (node_modules)
if [ ! -d "node_modules" ]; then
  log_info "Pasta node_modules não encontrada. Instalando dependências..."
  npm install
fi

# 2. Validação de tipos TypeScript (opcional se --rapido)
if [ "$MODO_RAPIDO" = false ]; then
  log_info "Verificando tipagem TypeScript (tsc --noEmit)..."
  npm run typecheck
  log_sucesso "Tipagem validada sem erros!"
fi

# 3. Build do plugin (gera a pasta ./dist)
log_info "Compilando o plugin para a pasta ./dist..."
npm run build
log_sucesso "Build concluído com sucesso em ./dist!"

# 4. Cópia opcional para diretório local de plugins do Grafana (caso não use Docker)
if [ -n "$DESTINO_LOCAL" ]; then
  PASTA_DESTINO="${DESTINO_LOCAL%/}/${PLUGIN_ID}"
  log_info "Copiando arquivos de ./dist para: ${PASTA_DESTINO}"
  mkdir -p "$PASTA_DESTINO"
  cp -r dist/* "$PASTA_DESTINO/"
  log_sucesso "Arquivos copiados para o diretório local do Grafana!"
fi

# 5. Subir ou Reiniciar o container do Grafana via Docker Compose
if command -v docker >/dev/null 2>&1; then
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${CONTAINER_NAME}$"; then
    log_info "Container '${CONTAINER_NAME}' já está em execução. Reiniciando para recarregar o plugin..."
    docker restart "$CONTAINER_NAME" >/dev/null
    log_sucesso "Container '${CONTAINER_NAME}' reiniciado!"
  elif docker ps -a --format '{{.Names}}' 2>/dev/null | grep -q "^${CONTAINER_NAME}$"; then
    log_info "Iniciando container existente '${CONTAINER_NAME}'..."
    docker start "$CONTAINER_NAME" >/dev/null
    log_sucesso "Container '${CONTAINER_NAME}' iniciado!"
  else
    log_info "Subindo ambiente Grafana em segundo plano (docker compose up -d)..."
    docker compose up -d
    log_sucesso "Container do Grafana criado e iniciado!"
  fi
else
  log_aviso "Docker não encontrado no PATH. A pasta ./dist já foi atualizada."
fi

echo ""
log_sucesso "Plugin atualizado e disponível em: ${GRAFANA_URL}"
echo -e "${AMARELO}💡 Dica: Pressione Ctrl+F5 no navegador para atualizar o painel no Grafana.${NC}"

# 6. Modo Watch opcional (recompila automaticamente ao salvar arquivos)
if [ "$MODO_WATCH" = true ]; then
  echo ""
  log_info "Modo Watch ativo: qualquer alteração salva em src/ será compilada automaticamente..."
  npm run dev
fi
