
variable "namespace_name" {
  description = "Nome do namespace Kubernetes do projeto"
  type        = string
  default     = "pedidos-veloz-terraform"
}

variable "project_name" {
  description = "Nome da aplicação"
  type        = string
  default     = "PedidosVeloz"
}
