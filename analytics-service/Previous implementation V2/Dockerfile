FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=4000
ENV NODE_ENV=production

EXPOSE 4000

USER node

CMD ["node", "server.js"]