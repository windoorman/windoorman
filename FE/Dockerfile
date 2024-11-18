FROM node:20 as build-stage
WORKDIR /FE

RUN npm install -g pnpm

COPY package*.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm run build

FROM nginx:stable-alpine as production-stage

#COPY conf/nginx.conf /etc/nginx/nginx.conf

COPY --from=build-stage /FE/dist /usr/share/nginx/html
COPY --from=build-stage /FE/dev-dist /usr/share/nginx/html

EXPOSE 5163

CMD ["nginx", "-g", "daemon off;"]