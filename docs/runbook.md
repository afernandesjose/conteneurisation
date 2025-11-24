# 📖 Runbook & Opérations

Ce guide détaille les procédures d'installation, de maintenance et de dépannage.

## 🛠️ Installation Complète

### 1. Préparation de l'environnement
S'assurer que Minikube dispose de suffisamment de ressources :
```bash
minikube start --force --disk-size=8000mb --addons ingress
```

### 2. Procédure de Build (Stratégie "Lightweight")
Pour éviter la saturation disque de Minikube, nous compilons le JS sur l'hôte :

```bash
# 1. Compilation Frontend sur l'hôte
cd app/front
npm install
npm run build
cd ../..

# 2. Construction des images dans le Docker Daemon de Minikube
eval $(minikube docker-env)
docker build -t todo-backend:latest -f app/back/Dockerfile .
docker build -t todo-frontend:latest -f app/front/Dockerfile app/front/
eval $(minikube docker-env -u)
```

### 3. Déploiement
```bash
kubectl apply -k k8s/
```

## 🚑 Troubleshooting

### Problème : "CrashLoopBackOff" sur la Database
* **Cause probable** : Manque d'espace disque pour `pg_wal`.
* **Solution** : Nettoyer les images inutilisées.
    ```bash
    minikube ssh 'docker system prune -a --volumes -f'
    kubectl delete pod -l app=postgres -n todo-app
    ```

### Problème : "Connection Refused" sur le Frontend
* **Cause** : Le conteneur tourne en mode non-root sur le port 8080, mais le service ou le port-forward vise le port 80.
* **Solution** : Utiliser le port 8080.
    ```bash
    kubectl port-forward deployment/frontend-deployment 8080:8080
    ```

### Problème : "ErrImageNeverPull"
* **Cause** : L'image n'a pas été buildée dans le contexte de Minikube.
* **Solution** : Refaire la commande `eval $(minikube docker-env)` avant le build.

## 🧹 Nettoyage
Pour supprimer toutes les ressources :
```bash
kubectl delete -k k8s/
```
