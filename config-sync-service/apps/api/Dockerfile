FROM oven/bun:1-alpine AS install
WORKDIR /service
COPY apps/api/package.json ./
RUN bun install --production
FROM oven/bun:1-alpine AS build
WORKDIR /service
COPY apps/api/package.json apps/api/tsconfig.json ./
RUN bun install
COPY apps/api/src ./src
RUN bun build src/index.ts --outdir dist --target bun
FROM oven/bun:1-alpine
WORKDIR /service
ENV NODE_ENV=production
COPY --from=install /service/node_modules ./node_modules
COPY --from=build /service/dist ./dist
USER bun
EXPOSE 3000
CMD ["bun","run","dist/index.js"]
