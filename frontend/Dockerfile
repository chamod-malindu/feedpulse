# BASEIMAGE 

FROM node:20-alpine

WORKDIR /app

# DEPENDENCIES 

COPY package*.json ./

RUN npm ci

# SOURCE CODE 

COPY . .

# ENVIRONMENT 

# Accept build argument passed from docker-compose (args: section)
# NEXT_PUBLIC_* variables MUST be set at BUILD TIME — not runtime
# Because Next.js bakes them into the JavaScript bundle during `next build`
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# BUILD 

RUN npm run build

# RUNTIME 

EXPOSE 3000

CMD ["npm", "start"]