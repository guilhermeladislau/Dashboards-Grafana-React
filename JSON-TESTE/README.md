# Dashboards de teste (TestData DB)

Plugin: `guilhermeladislau-zabbixmonitor-panel`
Arquivos:
- [`dashboard-monitoramento-ti-testdata.json`](./dashboard-monitoramento-ti-testdata.json)
- [`monitoramento-ficticio-plugin.json`](./monitoramento-ficticio-plugin.json)

Esses dashboards usam o datasource nativo `grafana-testdata` do Grafana para testar os componentes do painel sem precisar de uma instancia do Zabbix ativa. As series simulam leituras em estados normal, atencao e critico.

## Como importar

1. No Grafana, abra **Dashboards > New > Import** (`/dashboard/import`).
2. Clique em **Upload dashboard JSON file** e escolha `JSON-TESTE/dashboard-monitoramento-ti-testdata.json`.
3. Selecione a sua instancia do datasource `grafana-testdata`.
4. Clique em **Import**.

A variavel `$datasource` no topo do dashboard permite trocar a instancia do TestData se necessario.

## Secoes do dashboard

### 1. Servidores de aplicacao e banco (Windows / Linux)
- `SRV-PROD-APP01` (CPU): gauge circular 360 (`circulo`), 64%.
- `SRV-PROD-APP01` (RAM): barra horizontal (`barra`), 88% (estado critico).
- `SRV-PROD-DB01` (Armazenamento): torre graduada (`torre`), 76% (atencao).
- `SRV-PROD-APP01` (ICMP Ping): somente status (`nenhum`), online.
- `SRV-PROD-APP01` (Rede): area preenchida (`area`) em Mbps/bps.
- `SRV-PROD-DB01` (Latencia de disco): linha continua (`linha`) em ms.
- `SRV-CLUSTER-SQL01`: modo `consolidado` agrupando CPU, memoria, disco e ping em um card.

### 2. Firewall e borda
- `FW-BORD-MATRIZ`: status geral, CPU (`circulo`, 52%), sessoes ativas (`area`, 42.150), trafego WAN download (920 Mbps), tuneis VPN IPsec, ameacas bloqueadas pelo IPS (`torre`) e card consolidado.

### 3. Virtualizacao e hipervisores (Hosts e VMs)
- `HOST-ESXI-01`: CPU fisica (76%), temperatura do chassi (`termometro`, 58 °C) e ocupacao do datastore SAN (`torre`, 74%).
- `VM-ERP-PROD`: CPU Ready (`bullet`, 7.8%), vCPU alocada (`arco`, 180°), IOPS de disco (`area`, 1.450 IOPS) e card consolidado.

### 4. Proxy, Wi-Fi e portas de switch
- `PROXY-EDGE-01`: taxa de cache hit (`anel`, 88%, limiar invertido) e requisicoes por segundo (`area`, 1.380 req/s).
- `AP-CORPORATIVO-01`: clientes conectados (`bullet`, 78) e qualidade do sinal (`anel`, 82%).
- `SW-CORE-01`: trafego de uplink (`linha`, 890 Mbps), utilizacao da porta (`barra`, 84%), consumo PoE (`barra`, 25.1 W) e erros CRC (`torre`, 0).

### 5. Multiplos dispositivos no mesmo card
- Cluster Web: comparativo de CPU entre 5 servidores (`SRV-WEB-01`, `SRV-WEB-02`, `SRV-DB-01`, `SRV-DB-02`, `SRV-API-01`).
- Cluster Kubernetes: comparativo de vCPU entre 4 VMs (`K8S-MASTER-01`, `K8S-WORKER-01`, `K8S-WORKER-02`, `K8S-INGRESS-01`).

## Tipos de grafico cobertos

| Chave | Formato | Exemplo no dashboard |
| :--- | :--- | :--- |
| `circulo` | Gauge circular 360° | `SRV-PROD-APP01` (CPU), `FW-BORD-MATRIZ` (CPU) |
| `barra` | Barra horizontal | `SRV-PROD-APP01` (RAM), `SW-CORE-01` (PoE) |
| `torre` | Colunas graduadas | `SRV-PROD-DB01` (Disco), `HOST-ESXI-01` (SAN) |
| `arco` | Semi-gauge 180° | `VM-ERP-PROD` (vCPU) |
| `anel` | Donut | `PROXY-EDGE-01` (Cache Hit), `AP-CORPORATIVO-01` (Sinal) |
| `bullet` | Medidor bullet com marcadores | `VM-ERP-PROD` (CPU Ready), `AP-CORPORATIVO-01` (Clientes) |
| `termometro` | Termometro vertical | `HOST-ESXI-01` (Temperatura) |
| `area` | Sparkline com area | `SRV-PROD-APP01` (Rede), `FW-BORD-MATRIZ` (Sessoes) |
| `linha` | Sparkline em linha | `SRV-PROD-DB01` (Latencia), `SW-CORE-01` (Uplink) |
| `nenhum` | Somente valor e tag de status | Ping, status do firewall, VPN |
