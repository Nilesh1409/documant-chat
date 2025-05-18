# syntax=docker/dockerfile:1     
FROM --platform=$TARGETPLATFORM node:18-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps

COPY package.json ./
RUN npm install --omit=dev --legacy-peer-deps 
RUN npm install --legacy-peer-deps                                


FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build                  

RUN npm prune --production


FROM base AS runner
ENV NODE_ENV=production


RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001
USER nextjs


COPY --from=builder /app/public            ./public
COPY --from=builder /app/.next/standalone  ./
COPY --from=builder /app/.next/static      ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
