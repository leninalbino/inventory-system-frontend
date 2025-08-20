# Dockerfile to serve Angular production build with NGINX
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --silent
COPY . .
RUN npm run build -- --configuration production

FROM nginx:stable-alpine
COPY --from=build /app/dist/inventory-system-frontend /usr/share/nginx/html
# Copy a simple nginx config if you want to enable SPA fallback
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]
