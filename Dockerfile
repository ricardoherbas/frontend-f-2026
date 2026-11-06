# Etapa 1: Construcción del frontend
FROM node:22-alpine AS build

WORKDIR /app

# Copiar configuración y dependencias
COPY package*.json ./
COPY .npmrc ./

# Instalar dependencias respetando el lockfile
RUN npm ci

# Copiar el código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# Etapa 2: Servidor web
FROM nginx:alpine

# Configurar Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]