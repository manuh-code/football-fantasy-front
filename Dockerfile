# ETAPA 1: Base y Dependencias (usada para Dev)
FROM node:20-alpine AS development

WORKDIR /var/www
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5174
CMD ["npm", "run", "dev", "--", "--host"]


FROM development AS build
RUN npm run build

FROM nginx:stable-alpine AS production
COPY config/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /var/www/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]