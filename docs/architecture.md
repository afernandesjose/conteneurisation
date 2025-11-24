# 🏗️ Architecture Technique

Ce document décrit l'architecture de l'application Todo 3-tiers déployée sur Kubernetes.

## 📐 Vue d'ensemble

L'application suit le modèle microservices 3-tiers classique :

1.  **Tier Présentation (Frontend)** :
    * **Tech** : React (Vite) servi par Nginx Alpine.
    * **Spécificité** : Configuration **Non-Root**. Nginx écoute sur le port `8080` au lieu de `80` pour permettre l'exécution par l'utilisateur `www` (UID 1000) sans privilèges élevés.
    * **Build** : Compilation statique locale (dossier `dist`) injectée dans l'image Docker pour réduire l'empreinte mémoire lors du CI.

2.  **Tier Logique (Backend)** :
    * **Tech** : Node.js / Express.
    * **Rôle** : API REST exposant les endpoints CRUD (`/api/todos`).
    * **Résilience** : Mécanisme de `retry` à la connexion pour attendre la disponibilité de la base de données.

3.  **Tier Données (Database)** :
    * **Tech** : PostgreSQL 15 (Image officielle).
    * **Stockage** : Persistance assurée par un `PersistentVolumeClaim` (PVC) de 5Gi, garantissant la survie des données en cas de redémarrage du Pod.

## 🔄 Flux de Données

```mermaid
graph LR
    User[Utilisateur] -- HTTP/8080 --> Front[Pod Frontend (Nginx+React)]
    Front -- REST API --> Back[Pod Backend (Node.js)]
    Back -- TCP/5432 --> DB[(Pod PostgreSQL)]
    DB -- Mount --> PVC[Volume Persistant]
```

## ⚙️ Choix Kubernetes

* **Deployments** : Utilisés pour le Front et le Back pour assurer la haute disponibilité (Scaling possible).
* **Services** : Type `ClusterIP` pour tous les composants afin de restreindre l'accès au réseau interne du cluster. L'accès externe est géré par `Ingress` ou `Port-Forward`.
* **Kustomize** : Gestion des manifestes via `kustomization.yaml` pour un déploiement unifié et ordonné.
* **Sondes (Probes)** :
    * *Liveness* : Vérifie si le processus tourne.
    * *Readiness* : Vérifie (pour le backend) si la connexion DB est active avant d'accepter du trafic.

