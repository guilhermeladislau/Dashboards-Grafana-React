# Projeto: Plugin Grafana para Monitoramento de TI (Zabbix)

## Visão Geral
Plugin de painel (**Panel Plugin**) customizado para Grafana, desenvolvido em **React** e **TypeScript** (`arxcyber-dashboardcustomizadoreact-panel`).
O objetivo é fornecer uma visão modular e dinâmica do monitoramento de infraestrutura de TI de clientes.

## Integração de Dados
- **Coleta:** Dados coletados via **Zabbix**.
- **Data Source:** O painel integra-se e consome dados provenientes do plugin **`alexanderzobnin-zabbix-app`**.

## Arquitetura e Componentes da UI
- **Blocos Dinâmicos:** Interface composta por blocos modulares independentes para cada métrica monitorada (ex.: Uso de CPU, Espaço em disco C:, Tráfego de Rede, Memória, etc.). A lista de métricas exibidas será refinada e validada ao longo do projeto.
- **Renderização Dinâmica:** Os blocos devem se adaptar e renderizar conforme os dados retornados pelas queries configuradas.

## Customizações via Editor do Grafana (`PanelOptions`)
O criador do dashboard deve conseguir customizar a aparência e comportamento diretamente pelo painel de opções do Grafana (`src/module.ts` e `src/types.ts`):
- **Identificação:** Título customizado do painel / blocos.
- **Estilização Visual:** Cor de fundo do painel/dashboard.
- **Tipografia:** Família da fonte e tamanho da fonte.
- **Extensibilidade:** Estrutura preparada para expansão contínua de novas opções de configuração visual e funcional.

## Regras Críticas do Repositório
- Consulte sempre `@./.config/AGENTS/instructions.md` antes de qualquer alteração de código.
- **NÃO modifique nada dentro da pasta `.config/`** (gerenciada pelas ferramentas do Grafana).
- **NÃO altere o `id` nem o `type`** em `src/plugin.json`.
- Modificações em `src/plugin.json` exigem reinicialização do servidor Grafana.
- Utilize a documentação oficial atualizada do Grafana (https://grafana.com/developers/plugin-tools/llms.txt) e componentes de `@grafana/ui`.
