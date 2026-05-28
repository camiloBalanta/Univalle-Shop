FROM node:20-alpine AS build

WORKDIR /usr/src/app
ENV PATH=/usr/src/app/node_modules/.bin:$PATH

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80
ENV NGINX_HOST=0.0.0.0

CMD ["nginx", "-g", "daemon off;"]
