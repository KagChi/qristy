FROM ghcr.io/hazmi35/node:20-dev-alpine as build-stage

WORKDIR /tmp/build

RUN corepack enable && corepack prepare pnpm@latest

RUN apk add --no-cache build-base git python3

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm run build

RUN pnpm prune --production

FROM ghcr.io/hazmi35/node:20-alpine

LABEL name "QRISTY API"
LABEL maintainer "KagChi"

WORKDIR /app

RUN apk add --no-cache tzdata

COPY --from=build-stage /tmp/build/services/api/package.json .
COPY --from=build-stage /tmp/build/pnpm-lock.yaml .
COPY --from=build-stage /tmp/build/services/api/node_modules ./node_modules
COPY --from=build-stage /tmp/build/services/api/dist ./dist

CMD node dist/index.js