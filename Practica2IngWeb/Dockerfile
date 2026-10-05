FROM oven/bun:1-alpine

WORKDIR /app

# Solo los manifiestos primero, para que la capa de dependencias se reutilice
# mientras no cambien package.json / bun.lock.
COPY package.json bun.lock ./
RUN bun install

COPY . .

EXPOSE 5173

# vite.config.js fija server.host, asi que ya escucha en 0.0.0.0.
CMD ["bun", "run", "dev"]