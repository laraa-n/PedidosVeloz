
terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.35"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

resource "kubernetes_namespace" "pedidos_veloz" {
  metadata {
    name = var.namespace_name
    labels = {
      app = "pedidos-veloz"
      managed_by = "terraform"
    }
  }
}
