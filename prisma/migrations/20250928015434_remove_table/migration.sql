/*
  Warnings:

  - You are about to drop the `DetailSummary` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."DetailSummary" DROP CONSTRAINT "DetailSummary_summaryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DetailSummary" DROP CONSTRAINT "DetailSummary_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DetailSummary" DROP CONSTRAINT "DetailSummary_userId_fkey";

-- DropTable
DROP TABLE "public"."DetailSummary";
