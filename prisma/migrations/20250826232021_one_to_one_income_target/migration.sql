/*
  Warnings:

  - The values [EXPENSE] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `IncomeTarget` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."TransactionType_new" AS ENUM ('INCOME', 'EXPENSEf');
ALTER TABLE "public"."Transaction" ALTER COLUMN "type" TYPE "public"."TransactionType_new" USING ("type"::text::"public"."TransactionType_new");
ALTER TYPE "public"."TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "public"."TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "public"."TransactionType_old";
COMMIT;

-- CreateIndex
CREATE UNIQUE INDEX "IncomeTarget_userId_key" ON "public"."IncomeTarget"("userId");
