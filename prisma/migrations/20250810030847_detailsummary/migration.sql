-- CreateTable
CREATE TABLE "public"."DetailSummary" (
    "id" TEXT NOT NULL,
    "summaryId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DetailSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DetailSummary_userId_summaryId_idx" ON "public"."DetailSummary"("userId", "summaryId");

-- CreateIndex
CREATE INDEX "DetailSummary_transactionId_idx" ON "public"."DetailSummary"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "DetailSummary_summaryId_transactionId_key" ON "public"."DetailSummary"("summaryId", "transactionId");

-- AddForeignKey
ALTER TABLE "public"."DetailSummary" ADD CONSTRAINT "DetailSummary_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "public"."Summary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DetailSummary" ADD CONSTRAINT "DetailSummary_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DetailSummary" ADD CONSTRAINT "DetailSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
