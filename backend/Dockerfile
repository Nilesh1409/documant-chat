# syntax=docker/dockerfile:1  
FROM --platform=$TARGETPLATFORM node:18-alpine

# Corepack + pnpm
RUN corepack enable && corepack prepare pnpm@8.15.6 --activate

# ---------- Set working directory ----------
WORKDIR /usr/src/app

# ---------- Copy manifests & install production deps ----------
# Copy only files that affect dependency resolution first so the layer can be cached
COPY package.json pnpm-lock.yaml ./

# Install *production* dependencies exactly as locked
RUN pnpm install --frozen-lockfile --prod

# ---------- Copy the rest of the application ----------
COPY . .

# ---------- Runtime setup ----------
# Create uploads directory with permissive rights (adjust if you prefer stricter)
RUN mkdir -p ./uploads && chmod 777 ./uploads

# Env vars
ENV NODE_ENV=production \
    PORT=8080

# Network
EXPOSE 8080

# ---------- Start the app ----------
CMD ["node", "server.js"]
