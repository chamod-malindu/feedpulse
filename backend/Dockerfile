# BASE IMAGE 
FROM node:20-alpine

WORKDIR /app

# DEPENDENCIES 
COPY package*.json ./

# include devDependencies for TypeScript build
RUN npm ci

#  BUILD 
COPY . .

RUN npm run build

# RUNTIME 
EXPOSE 4000

CMD ["node", "dist/server.js"]