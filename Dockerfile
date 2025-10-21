# Etapa 1: Instalar dependencias de desarrollo
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Etapa 2: Construir la aplicación
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# Etapa 3: Imagen de producción con nginx
FROM nginx:alpine AS runner

# Copiar archivos estáticos del build (React Router v7 con ssr: false genera en build/client/)
COPY --from=builder /app/build/client /usr/share/nginx/html

# Copiar archivos públicos individuales (favicon, logo, etc.)
COPY --from=builder /app/public/favicon.ico /usr/share/nginx/html/
COPY --from=builder /app/public/logo.png /usr/share/nginx/html/

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Variables de entorno
ENV NODE_ENV=production