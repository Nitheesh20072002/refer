FROM node:18-alpine

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies inside container
RUN npm install

# Copy rest of source code
COPY . .

# Build inside container
RUN npm run build

EXPOSE 3000

CMD ["npx", "next", "start"]
