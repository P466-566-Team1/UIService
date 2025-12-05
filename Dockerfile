FROM node:20.19.0 AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build --prod

FROM nginx:stable-alpine
COPY --from=build /app/dist/picture-dictionary/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
