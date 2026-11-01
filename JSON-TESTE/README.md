# Dashboard de Demonstração e Testes (TestData DB)
**Plugin:** `arxcyber-dashboardcustomizadoreact-panel`  
**Arquivo JSON:** [`dashboard-monitoramento-ti-testdata.json`](./dashboard-monitoramento-ti-testdata.json)

---

## 📌 Visão Geral
Este dashboard foi construído especificamente para **testar e demonstrar 100% dos recursos** do plugin customizado no Grafana, utilizando a fonte de dados padrão do Grafana **`grafana-testdata` (TestData DB)**. 

Não requer conexão ativa com o Zabbix para ser visualizado. Todos os dados fictícios foram calibrados para simular um ambiente corporativo real de TI com múltiplos cenários (status OK/Verde, Atenção/Amarelo e Crítico/Vermelho).

---

## 🚀 Como Importar no Grafana

1. No Grafana, acesse o menu lateral: **Dashboards** > **New** > **Import** (ou acesse diretamente `/dashboard/import`).
2. Clique em **Upload dashboard JSON file** e selecione o arquivo:
   ```
   JSON-TESTE/dashboard-monitoramento-ti-testdata.json
   ```
   *(Ou abra o arquivo, copie todo o conteúdo JSON e cole no campo "Import via panel json")*.
3. No seletor de Data Source, verifique se está selecionada a sua fonte de dados **`grafana-testdata`** (ou selecione a sua instância do TestData).
4. Clique em **Import**.

---

## 🗂️ Estrutura e Seções do Dashboard

### 1. 🖥️ Servidores de Aplicação e Banco de Dados (Windows / Linux)
* **SRV-PROD-APP01 • CPU:** Gráfico Gauge Circular 360° (`circulo`), valor em 64% (Normal/Verde).
* **SRV-PROD-APP01 • Memória RAM:** Gráfico Barra Horizontal (`barra`), valor em 88% (Crítico/Vermelho com status dinâmico).
* **SRV-PROD-DB01 • Armazenamento:** Gráfico Torre Vertical Graduada (`torre`), valor em 76% (Atenção/Amarelo).
* **SRV-PROD-APP01 • ICMP Ping:** Card com Somente Valor/Status (`nenhum`), indicando estado **ONLINE**.
* **SRV-PROD-APP01 • Tráfego de Rede:** Gráfico Linha com Área Preenchida (`area`), unidade em **Mbps/bps**.
* **SRV-PROD-DB01 • Latência de Disco:** Gráfico Linha Contínua Pura / Sparkline (`linha`), unidade em **ms**.
* **SRV-CLUSTER-SQL01 • Card Consolidado:** Demonstração do modo **`consolidado`** (CPU, Memória, Disco e Ping agrupados em 1 único card).

### 2. 🛡️ Firewall & Segurança de Borda (FortiGate / pfSense / Sophos)
* **FW-BORD-MATRIZ • Status Geral:** Status do Appliance (ONLINE).
* **FW-BORD-MATRIZ • CPU Firewall:** Gráfico Gauge Circular 360° em 52%.
* **FW-BORD-MATRIZ • Sessões Ativas:** Gráfico Área com gradiente ciano para contador de 42.150 sessões.
* **FW-BORD-MATRIZ • Tráfego WAN Download:** Throughput de 920 Mbps no link de internet.
* **FW-BORD-MATRIZ • Túneis VPN IPsec:** Status de conectividade VPN (Conectado / Online).
* **FW-BORD-MATRIZ • Ameaças Bloqueadas (IPS):** Gráfico Torre Vertical para contagem de ataques mitigados.
* **FW-BORD-MATRIZ • Card Consolidado Firewall:** Múltiplas métricas de segurança em um card.

### 3. 🖧 Virtualização & Hipervisores (Hosts Físicos & VMs)
* **HOST-ESXI-01 • CPU Física:** Medidor circular de processamento do hipervisor (76% Atenção).
* **HOST-ESXI-01 • Temperatura de Chassi:** Gráfico **Termômetro Vertical** (`termometro`) calibrado a 58 °C.
* **HOST-ESXI-01 • Datastore SAN:** Gráfico Torre com percentual de ocupação do storage (74%).
* **VM-ERP-PROD • CPU Contenção (Ready):** Gráfico **Medidor Bullet** (`bullet`) com linhas de limiar (7.8%).
* **VM-ERP-PROD • vCPU Alocada:** Gráfico **Arco / Semi-Gauge 180°** (`arco`).
* **VM-ERP-PROD • IOPS de Disco:** Gráfico Área para operações por segundo (1.450 IOPS).
* **VM-ERP-PROD • Card Consolidado VM:** Visão completa da máquina virtual.

### 4. 🌐 Conectividade: Proxy Web, Wi-Fi e Portas de Switch
* **PROXY-EDGE-01 • Taxa de Cache Hit:** Gráfico **Anel / Donut Moderno com Glow** (`anel`) em 88% com limiar invertido.
* **PROXY-EDGE-01 • Requisições por Segundo:** Gráfico Área com Throughput HTTP (1.380 req/s).
* **AP-CORPORATIVO-01 • Clientes Wi-Fi Ativos:** Gráfico Bullet com lotação de clientes (78 associados).
* **AP-CORPORATIVO-01 • Qualidade de Sinal:** Gráfico Anel para qualidade média da RF (82%).
* **SW-CORE-01 [Gi1/0/24] • Tráfego Uplink:** Gráfico Linha sparkline pura com 890 Mbps.
* **SW-CORE-01 [Gi1/0/24] • Utilização da Porta:** Gráfico Barra com saturação do link (84%).
* **SW-CORE-01 [Gi1/0/48] • Consumo PoE:** Gráfico Barra com potência em Watts (25.1 W).
* **SW-CORE-01 [Gi1/0/24] • Erros CRC:** Gráfico Torre indicando 0 descartes/erros.

### 5. 📦 Monitoramento de Múltiplos Dispositivos no Mesmo Card
* **Cluster Web • Comparativo de CPU (5 Servidores):** Demonstração do recurso **`multiDevices`** monitorando 5 servidores (`SRV-WEB-01`, `SRV-WEB-02`, `SRV-DB-01`, `SRV-DB-02`, `SRV-API-01`) em um único painel.
* **Cluster Kubernetes • Comparativo de vCPU (4 VMs):** 4 Máquinas Virtuais (`K8S-MASTER-01`, `K8S-WORKER-01`, `K8S-WORKER-02`, `K8S-INGRESS-01`) no mesmo card.

---

## 🎨 Biblioteca de Gráficos e Estilos Apresentados

| Gráfico | Nome no Seletor | Onde está demonstrado no Dashboard |
| :--- | :--- | :--- |
| **Círculo / Gauge 360°** | `circulo` | SRV-PROD-APP01 (CPU), FW-BORD-MATRIZ (CPU), HOST-ESXI-01 (CPU) |
| **Barra Horizontal** | `barra` | SRV-PROD-APP01 (RAM), SW-CORE-01 (Utilização e PoE) |
| **Torre Graduada** | `torre` | SRV-PROD-DB01 (Disco), FW-BORD-MATRIZ (Ataques), HOST-ESXI-01 (SAN) |
| **Arco / Semi-Gauge 180°** | `arco` | VM-ERP-PROD (vCPU) |
| **Anel / Donut com Glow** | `anel` | PROXY-EDGE-01 (Cache Hit), AP-CORPORATIVO-01 (Sinal Wi-Fi) |
| **Medidor Bullet** | `bullet` | VM-ERP-PROD (CPU Ready), AP-CORPORATIVO-01 (Clientes Wi-Fi) |
| **Termômetro Vertical** | `termometro` | HOST-ESXI-01 (Temperatura do Hardware) |
| **Área com Gradiente** | `area` | SRV-PROD-APP01 (Rede), FW-BORD-MATRIZ (Sessões), PROXY (Req/s) |
| **Linha Contínua Pura** | `linha` | SRV-PROD-DB01 (Latência), SW-CORE-01 (Tráfego Uplink) |
| **Sem Gráfico / Status** | `nenhum` | Conectividade Ping, Status Firewall, Túneis VPN |

---

## ⚙️ Variável de Datasource
O dashboard inclui uma variável no topo:
* **`$datasource`**: Permite alternar rapidamente para qualquer outra instância de TestData instalada no seu Grafana se necessário.
