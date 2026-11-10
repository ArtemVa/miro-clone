# Образ api. Собирается из корня репозитория:
#   docker build -f apps/api/Dockerfile -t miro-clone-api .
# Стадия migrate: одноразовый запуск миграций, в ней есть Prisma CLI из devDependencies.

FROM node:24-alpine AS build
# Prisma CLI нужен openssl
RUN apk add --no-cache openssl
RUN corepack enable
# Git-хуки в образе не нужны
ENV HUSKY=0
WORKDIR /repo

# Сначала только манифесты: пока они не менялись, слой с зависимостями берётся из кэша
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json apps/api/
COPY packages/contracts/package.json packages/contracts/
COPY packages/typescript-config/package.json packages/typescript-config/
RUN pnpm install --frozen-lockfile --filter @repo/api...

COPY packages packages
COPY apps/api apps/api
RUN pnpm --filter @repo/api db:generate && pnpm --filter @repo/api build
# Только production-зависимости api, отдельной папкой
RUN pnpm --filter @repo/api deploy --prod /prod/api

FROM build AS migrate
WORKDIR /repo/apps/api
# Без рамки «доступна новая версия Prisma» в логах
ENV PRISMA_HIDE_UPDATE_MESSAGE=1
CMD ["pnpm", "db:deploy"]

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /prod/api/package.json ./
COPY --from=build /prod/api/node_modules node_modules
COPY --from=build /repo/apps/api/dist dist
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
