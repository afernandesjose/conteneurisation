# 🔐 Sécurité et Bonnes Pratiques

Ce document recense les mesures de sécurité implémentées dans le projet.

## 🛡️ Conteneurs "Non-Root"

L'exécution de conteneurs en tant que root est une faille de sécurité majeure. Nous avons appliqué le principe de moindre privilège :

### Frontend (Nginx)
* Utilisation de l'image de base `nginx:alpine-slim`.
* Création d'un utilisateur dédié `www`.
* Modification des permissions sur `/var/cache/nginx` et `/var/run/` pour permettre l'écriture par `www`.
* **Changement de Port** : Nginx écoute sur le port **8080** (ports > 1024) car les ports privilégiés (80) sont interdits aux utilisateurs non-root.

### Backend (Node.js)
* Utilisation de l'utilisateur `nodeuser` (ou `appuser`) créé spécifiquement dans le Dockerfile.
* Le code appartient à cet utilisateur, empêchant une élévation de privilèges en cas de compromission du processus Node.

## 🔑 Gestion des Secrets

* Les identifiants de base de données (User/Password) ne sont **pas** codés en dur dans les manifestes de Déploiement.
* Ils sont injectés via des **Kubernetes Secrets** (`secret.yaml`) et consommés comme variables d'environnement par les pods.
* *Note pour la production* : En environnement réel, ces secrets ne devraient pas être committés dans git mais gérés par un vault ou SealedSecrets.

## 📡 Réseau

* Aucun Pod n'est exposé directement sur internet (Pas de `NodePort`).
* L'exposition se fait uniquement via un Service `ClusterIP` interne, accessible uniquement via Ingress ou Port-Forward authentifié.
