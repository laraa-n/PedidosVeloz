
output "namespace_name" {
  description = "Namespace Kubernetes definido pelo Terraform"
  value       = kubernetes_namespace.pedidos_veloz.metadata[0].name
}

output "project_name" {
  description = "Nome do projeto"
  value       = var.project_name
}
