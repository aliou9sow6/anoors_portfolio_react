# Dockerfile pour le Frontend React
FROM node:22-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances en utilisant le lockfile pour versions résolues
# et empêcher l'exécution de scripts potentiellement non sûrs
RUN npm ci --ignore-scripts

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build

# Étape de production avec nginx
FROM nginx:alpine

# Copier les fichiers buildés vers nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
