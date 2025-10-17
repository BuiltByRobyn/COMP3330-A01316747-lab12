# syntax=docker/dockerfile:1
FROM oven/bun:1 as base
WORKDIR /app

# Install deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Build frontend
COPY frontend ./frontend
RUN cd frontend && bun run build

# Copy server and compiled frontend to ./server/public
COPY server ./server
RUN mkdir -p server/public && cp -r frontend/dist/* server/public/

# Start runtime image
FROM oven/bun:1 as runtime
WORKDIR /app
COPY --from=base /app /app

ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "run", "server/index.ts"]
