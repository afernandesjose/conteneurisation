# 📝 Kubernetes Todo App (3-Tiers)

Application de gestion de tâches (Todo List) déployée sur Kubernetes suivant une architecture 3-tiers stricte et sécurisée.

<img width="955" height="477" alt="image" src="https://github.com/user-attachments/assets/d2eb671b-d0b6-4295-883f-79addd29d0b2" />

## 🚀 Fonctionnalités
* **Frontend** : React + Vite (Servi par Nginx non-root)
* **Backend** : Node.js + Express
* **Database** : PostgreSQL (Persistance via PVC)
* **Sécurité** : Conteneurs non-root, Secrets K8s, Ports non-privilégiés.

## 📂 Structure du Projet
```text
todo-app-k8s/
├── app/
│   ├── front/    # Code source React + Dockerfile optimisé
│   └── back/     # Code source Node.js API + Dockerfile
├── k8s/          # Manifestes Kubernetes (Kustomize)
├── docs/         # Documentation technique (Architecture, Runbook, Sécurité)
└── README.md
```

## 🛠️ Prérequis
* Docker
* Minikube
* Node.js & npm (pour le build frontend local)
* kubectl

## ⚡ Démarrage Rapide

1. **Démarrer l'environnement**
   ```bash
   minikube start --addons ingress
   ```

2. **Build des images** (Stratégie hybride pour économiser l'espace disque)
   ```bash
   # Build Front local
   cd app/front && npm install && npm run build && cd ../..
   
   # Build Docker (dans Minikube)
   eval $(minikube docker-env)
   docker build -t todo-backend:latest -f app/back/Dockerfile .
   docker build -t todo-frontend:latest -f app/front/Dockerfile app/front/
   eval $(minikube docker-env -u)
   ```

3. **Déploiement**
   ```bash
   kubectl apply -k k8s/
   ```

4. **Accès**
   ```bash
   # Accès direct via port-forward
   kubectl port-forward deployment/frontend-deployment 8080:8080
   # Ouvrir http://localhost:8080
   ```

Pour plus de détails, voir le [Runbook](docs/runbook.md).
