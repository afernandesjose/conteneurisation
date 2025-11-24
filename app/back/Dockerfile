# Stage 1: Dependencies (Optimisation - seulement les prod dependencies)
FROM node:20-alpine AS dependencies

# Créer un utilisateur non-root pour le runtime
RUN addgroup --system appgroup && adduser --system --ingroup appgroup nodeuser
USER nodeuser
WORKDIR /app

# Installer les dépendances de production
COPY app/back/package*.json ./
RUN npm ci --only=production

# Stage 2: Build pour inclure les tests et dev dependencies (facultatif si on exécute les tests)
FROM node:20-alpine AS build_test

# Installer toutes les dépendances
USER root
WORKDIR /app
COPY app/back/package*.json ./
RUN npm ci

# Stage 3: Final - Runtime Image
FROM node:20-alpine AS final

# Créer le même utilisateur non-root que dans la première étape
RUN addgroup --system appgroup && adduser --system --ingroup appgroup nodeuser
USER nodeuser
WORKDIR /app

# Copier les prod dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copier le code source de l'application
COPY app/back/src ./src

# Définir la variable d'environnement pour le port
ENV PORT=3001

# Port d'écoute
EXPOSE 3001

# Commande de démarrage
CMD ["node", "src/server.js"]
