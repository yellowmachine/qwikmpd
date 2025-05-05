ARG NODE_VERSION=18.18.2

################################################################################
# Base image para todas las etapas
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /usr/src/app

# Habilita corepack para usar pnpm
RUN corepack enable

################################################################################
# Etapa para instalar dependencias (cacheable)
FROM base AS deps

# Copia solo package.json y pnpm-lock.yaml para instalar dependencias
COPY package.json pnpm-lock.yaml ./

# Usa cache mount para acelerar instalación
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

################################################################################
# Etapa para construir la aplicación
FROM deps AS build

# Copia el resto de archivos
COPY . .

# Construye la app para producción
RUN pnpm run build

################################################################################
# Etapa final para producción
FROM base AS final

ENV NODE_ENV=production

WORKDIR /app
RUN mkdir -p /app/data && chown -R node:node /app/data

# Usa usuario no root (opcional)
USER node

# Copia package.json para poder usar pnpm si hace falta
COPY package.json .

# Copia node_modules desde deps y build desde build
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/server ./server

# Expone el puerto (ajusta si usas otro)
EXPOSE 3000

# Comando para arrancar la app (ajusta según tu script)
CMD ["pnpm", "serve"]
