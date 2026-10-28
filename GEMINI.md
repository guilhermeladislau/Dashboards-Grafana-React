# Projeto: Plugin Grafana para Monitoramento de TI (Zabbix)

## Visão Geral
Plugin de painel (**Panel Plugin**) customizado para Grafana, desenvolvido em **React** e **TypeScript** (`arxcyber-dashboardcustomizadoreact-panel`).
O objetivo é fornecer uma visão modular e dinâmica do monitoramento de infraestrutura de TI de clientes.

## Integração de Dados
- **Coleta:** Dados coletados via **Zabbix**.
- **Data Source:** O painel integra-se e consome dados provenientes do plugin **`alexanderzobnin-zabbix-app`**.

## Arquitetura e Componentes da UI
- **Blocos Dinâmicos por Dispositivo:** Componentes dedicados para cada dispositivo (`Firewall`, `VM`, `Proxy`, `Host`, `Servidor`, `Access Point`, `Porta de Rede`).
- **Modos de Exibição:** 1 Métrica por Card (`individual`) ou Várias Métricas no Mesmo Card (`consolidado`).
- **Filtro de Dispositivos Monitorados:** Controle de quantidade máxima de dispositivos/métricas exibidos por card ou painel.
- **Dimensionamento Modular:** Ajuste de escala dos blocos (`Pequeno / Compacto`, `Médio / Padrão`, `Grande / Amplo`, `Extra Grande / Expandido`) e altura mínima customizada em pixels.
- **Biblioteca de Gráficos Integrados:** Barra horizontal, Círculo/Gauge 360°, Arco/Semi-Gauge 180°, Anel/Donut Moderno, Torre/Colunas verticais, Área com gradiente, Linha contínua pura, Medidor Bullet e Termômetro vertical.
- **Renderização Dinâmica:** Os blocos se adaptam e renderizam conforme os dados retornados pelas queries configuradas.

## Customizações via Editor do Grafana (`PanelOptions`)
O criador do dashboard customiza a aparência e comportamento diretamente pelo editor de opções do Grafana:
- **Dispositivo e Monitoramento:**
  - Seleção do Tipo de Dispositivo e métrica pré-configurada correspondente.
  - Modo do Card (`individual` ou `consolidado`) e limite de dispositivos/métricas exibidas (`maxDevices`).
  - **Subcategoria Standard Options:** Unidade da métrica (Unit), controle de casas decimais com caixinha "Auto" e campo manual (0 ou vazio = ilimitado), nome de exibição (Display Name), prefixo (Prefix), sufixo (Suffix), valores mínimos/máximos da escala e texto sem leitura (No Value).
- **Estilização Visual:**
  - **Variações dos Gráficos:** Seleção do tipo de gráfico integrado (`barra`, `circulo`, `arco`, `anel`, `torre`, `area`, `linha`, `bullet`, `termometro` ou `nenhum`), cor customizada e switches de visibilidade.
  - **Cores e Limiares:** Esquema de limiares (normal, invertido, fixo), valores de warning/critical, cores individuais por estado (OK, Warning, Critical, Fixo) e cores de fundo/borda.
  - **Tipografia:** Família da fonte e escala de tamanho da fonte.
  - **Layout dos Blocos:** Dimensionamento dos blocos (`sm`, `md`, `lg`, `xl`), altura customizada em pixels, colunas e tag de status.
- **Identificação:** Nome/etiqueta do dispositivo, título geral do painel e suporte a variáveis do Grafana.

## Regras Críticas do Repositório
- Consulte sempre `@./.config/AGENTS/instructions.md` antes de qualquer alteração de código.
- **NÃO modifique nada dentro da pasta `.config/`** (gerenciada pelas ferramentas do Grafana).
- **NÃO altere o `id` nem o `type`** em `src/plugin.json`.
- Modificações em `src/plugin.json` exigem reinicialização do servidor Grafana.
- Utilize a documentação oficial atualizada do Grafana (https://grafana.com/developers/plugin-tools/llms.txt) e componentes de `@grafana/ui`.
