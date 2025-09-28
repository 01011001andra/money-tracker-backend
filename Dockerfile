FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package*.json ./
# skip postinstall
RUN npm ci --ignore-scripts --no-audit --fund=false

# sekarang bawa prisma & source
COPY prisma ./prisma
COPY . .

# jalankan prisma generate manual (set schema jika perlu)
# RUN npx prisma generate --schema=./prisma/schema/schema.prisma
RUN npx prisma generate
RUN npm run build

# ---- runtime sama seperti Cara A ----
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --fund=false

COPY prisma ./prisma
RUN npx prisma generate
COPY --from=build /app/dist ./dist

# ENV
ENV DATABASE_URL=postgresql://postgres.lottmdgrezcvjpevmsnh:prisma@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
ENV JWT_SECRET=xczvnas;ogjidf-8034tuyasrghjnlas1242ed

EXPOSE 8000
CMD ["node","dist/src/main.js"]
