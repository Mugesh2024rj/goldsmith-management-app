FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev
COPY . .
ENV PORT=8080
ENV DB_HOST=goldsmith_db
ENV DB_USER=root
ENV DB_PASSWORD=2006
ENV DB_NAME=goldsmith_db
ENV JWT_SECRET=goldsmith_jwt_secret_key_2024
ENV JWT_EXPIRES_IN=99999d
EXPOSE 8080
CMD ["node", "server.js"]


