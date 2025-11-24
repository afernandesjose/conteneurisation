FROM nginx:alpine-slim

# Copier la configuration Nginx
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Copier le dossier dist (généré localement)
COPY dist /usr/share/nginx/html

# CONFIGURATION CRITIQUE NON-ROOT :
# 1. Créer l'utilisateur www
# 2. Créer TOUS les dossiers temporaires nécessaires à Nginx (proxy, client, fastcgi, etc.)
# 3. Créer le fichier PID (car non-root ne peut pas le créer dans /var/run par défaut)
# 4. Donner la propriété de tout cela à 'www'
RUN adduser -D -g 'www' www     && mkdir -p /var/cache/nginx/client_temp     && mkdir -p /var/cache/nginx/proxy_temp     && mkdir -p /var/cache/nginx/fastcgi_temp     && mkdir -p /var/cache/nginx/uwsgi_temp     && mkdir -p /var/cache/nginx/scgi_temp     && chown -R www:www /var/cache/nginx     && chown -R www:www /usr/share/nginx/html     && touch /var/run/nginx.pid     && chown www:www /var/run/nginx.pid     && chown -R www:www /etc/nginx/conf.d

# Passer en utilisateur non-root
USER www

# Exposer le port 8080
EXPOSE 8080

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
