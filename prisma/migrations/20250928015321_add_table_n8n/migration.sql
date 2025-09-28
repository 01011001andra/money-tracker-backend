-- CreateTable
CREATE TABLE "public"."N8N" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "N8N_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "N8N_userId_key" ON "public"."N8N"("userId");

-- AddForeignKey
ALTER TABLE "public"."N8N" ADD CONSTRAINT "N8N_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
