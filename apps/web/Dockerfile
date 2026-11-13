# Образ web: сборка Vite и nginx. Собирается из корня репозитория:
#   docker build -f apps/web/Dockerfile -t miro-clone-web .
# nginx отдаёт статику и проксирует /api и /ws на api (apps/web/nginx.conf).

FROM node:24-alpine AS build
RUN corepack enable
# Git-хуки в образе не нужны
ENV HUSKY=0
WORKDIR /repo

# Сначала только манифесты: пока они не менялись, слой с зависимостями берётся из кэша
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json apps/web/
COPY packages/contracts/package.json packages/contracts/
COPY packages/typescript-config/package.json packages/typescript-config/
RUN pnpm install --frozen-lockfile --filter @repo/web...

COPY packages packages
COPY apps/web apps/web
RUN pnpm --filter @repo/web build

FROM nginx:1.30-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
