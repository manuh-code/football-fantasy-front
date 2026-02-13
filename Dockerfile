# ETAPA 1: Base y Dependencias (usada para Dev)
FROM node:20-alpine AS development

WORKDIR /var/www
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5174
CMD ["npm", "run", "dev", "--", "--host"]


FROM development AS build

# Variables de entorno para el build de producción
ARG VITE_APP_TITLE="Football Fantasy"
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME="Football Fantasy"
ARG VITE_APP_SHORT_NAME="FootballFantasy"
ARG VITE_ABLY_PUBLIC_KEY=
ARG VITE_ABLY_KEY=
ARG VITE_ABLY_CLUSTER="mt1"

# Pasar las variables al build
ENV VITE_APP_TITLE=$VITE_APP_TITLE
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_SHORT_NAME=$VITE_APP_SHORT_NAME
ENV VITE_ABLY_PUBLIC_KEY=$VITE_ABLY_PUBLIC_KEY
ENV VITE_ABLY_KEY=$VITE_ABLY_KEY
ENV VITE_ABLY_CLUSTER=$VITE_ABLY_CLUSTER

RUN npm run build

FROM nginx:stable-alpine AS production
COPY config/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /var/www/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]