# PedidosVeloz — Plataforma de Pedidos em Microsserviços

## 1. Sobre o projeto

O **PedidosVeloz** é uma aplicação baseada em arquitetura de microsserviços, desenvolvida como projeto acadêmico da disciplina Cloud DevOps.

O objetivo é demonstrar o ciclo de desenvolvimento e operação de uma aplicação distribuída, utilizando Docker, Docker Compose, Kubernetes, GitHub Actions, Prometheus, Grafana e Terraform.

A solução simula uma plataforma de pedidos de comércio eletrônico, composta por quatro microsserviços e um banco de dados PostgreSQL.

## 2. Arquitetura

A aplicação é composta pelos seguintes serviços:

| Serviço | Responsabilidade | Porta |
|---|---|---:|
| API Gateway | Recebe e direciona as requisições | 3000 |
| Orders Service | Criação e consulta de pedidos | 3001 |
| Payments Service | Simulação de processamento de pagamentos | 3002 |
| Inventory Service | Consulta e reserva de estoque | 3003 |
| PostgreSQL | Persistência dos dados | 5432 |

O API Gateway centraliza o acesso aos serviços, enquanto cada microsserviço possui suas próprias responsabilidades funcionais.

**Tecnologias utilizadas:**
- Node.js e Express
- PostgreSQL
- Docker e Docker Compose
- Kubernetes
- GitHub Actions
- GitHub Container Registry (GHCR)
- Prometheus
- Grafana
- cAdvisor
- Terraform (estrutura inicial de IaC)

## 3. Executando localmente com Docker Compose

### Pré-requisitos
- Docker Desktop
- Docker Compose
- Git

### Configuração

Clone o repositório:

```bash
git clone https://github.com/laraa-n/PedidosVeloz.git
cd PedidosVeloz
```

Configure as variáveis de ambiente utilizando o arquivo de exemplo:

```powershell
Copy-Item .env.example .env
```

Revise os valores do arquivo `.env` conforme as variáveis utilizadas no `docker-compose.yml`.

### Inicialização

Execute:

```bash
docker compose up -d --build
```

Verifique os contêineres:

```bash
docker compose ps
```

### Endpoints locais

- API Gateway: http://localhost:3004
- Orders Service: http://localhost:3005
- Payments Service: http://localhost:3006
- Inventory Service: http://localhost:3007

Verificação de saúde:

http://localhost:3004/health

## 4. Kubernetes

O projeto possui manifests Kubernetes organizados em `infra/kubernetes`.

Foram configurados:

- Deployments e Services para os microsserviços.
- Deployment e Service para PostgreSQL.
- ConfigMaps e Secrets para configuração.
- Readiness e Liveness Probes.
- Réplicas dos serviços.
- Recursos de CPU e memória.
- Horizontal Pod Autoscaler (HPA).

O ambiente foi executado no Kubernetes disponibilizado pelo Docker Desktop.

Para aplicar os recursos, com o contexto Kubernetes configurado:

```powershell
kubectl apply -f .\infra\kubernetes\namespace.yaml
kubectl apply -f .\infra\kubernetes\configmap.yaml
kubectl apply -f .\infra\kubernetes\secret.yaml
```

Em seguida, aplique os manifests de PostgreSQL e dos quatro microsserviços, além do arquivo `hpa.yaml`.

O arquivo `metrics-server-patch.yaml` é um patch específico para o ambiente local e não deve ser aplicado como um manifesto comum.

Para verificar os recursos:

```bash
kubectl get pods -n pedidos-veloz
kubectl get services -n pedidos-veloz
kubectl get hpa -n pedidos-veloz
```

A API Gateway pode ser acessada localmente pela porta NodePort 30080.

## 5. CI/CD

O pipeline está definido em:

`.github/workflows/ci-cd.yml`

A automação utiliza GitHub Actions para:

1. Obter o código do repositório.
2. Preparar o ambiente Node.js.
3. Instalar dependências.
4. Executar validações de sintaxe.
5. Construir imagens Docker.
6. Publicar imagens no GitHub Container Registry em eventos de push na branch principal.

A autenticação no registry utiliza o `GITHUB_TOKEN`, disponibilizado pelo próprio GitHub Actions.

## 6. Observabilidade

A estrutura de monitoramento está em `monitoring`.

Foram utilizados:

- **Prometheus:** coleta e consulta de métricas.
- **Grafana:** visualização dos indicadores.
- **cAdvisor:** coleta de métricas dos contêineres Docker.

Para iniciar o ambiente de monitoramento:

```bash
docker compose -f monitoring/docker-compose.monitoring.yml up -d
```

Acessos locais:

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3008

O dashboard desenvolvido apresenta:
- Consumo de CPU dos microsserviços.
- Utilização de memória.
- Quantidade de contêineres ativos.

A coleta de logs é realizada por meio dos comandos do Docker Compose.

O tracing distribuído foi definido como estratégia arquitetural para evolução com OpenTelemetry, mas ainda não foi instrumentado nesta versão do MVP.

## 7. Escalabilidade e estratégia de deploy

O projeto utiliza Horizontal Pod Autoscaler (HPA), configurado para monitorar a utilização de CPU, com alvo de 70%, mínimo de duas réplicas e máximo de quatro réplicas por serviço.

A estratégia de atualização proposta é Rolling Update, permitindo substituir gradualmente as instâncias durante novas versões, reduzindo o risco de indisponibilidade.

## 8. Infraestrutura como código

A pasta `infra/terraform` contém a estrutura inicial de Terraform, com:

- `main.tf`
- `variables.tf`
- `outputs.tf`

O objetivo é demonstrar a organização da infraestrutura como código e permitir sua evolução para provisionamento automatizado do ambiente Kubernetes.

O Terraform não foi executado nesta versão do projeto.

## 9. Segurança e boas práticas

Foram adotadas algumas práticas de segurança:

- Execução dos contêineres com usuário não-root.
- Separação de configurações e credenciais.
- Utilização de `.env` local e `.env.example` para referência.
- Arquivos com credenciais excluídos do versionamento.
- Uso de Secrets no Kubernetes.
- Imagens baseadas em Node.js Alpine.

As credenciais de demonstração não devem ser utilizadas em ambientes de produção.

## 10. Demonstração em vídeo

**Link do vídeo:** ().

## 11. Considerações finais

O PedidosVeloz demonstra uma implementação acadêmica de uma plataforma distribuída, contemplando conteinerização, orquestração, automação de build e publicação de imagens, monitoramento e escalabilidade.

A solução constitui um MVP funcional e uma base para futuras evoluções, como testes automatizados, tracing distribuído instrumentado, persistência mais robusta no Kubernetes e provisionamento completo por Terraform.