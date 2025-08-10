/*
  Warnings:

  - You are about to alter the column `totalIncome` on the `MonthlySummary` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `BigInt`.
  - You are about to alter the column `totalExpense` on the `MonthlySummary` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `BigInt`.
  - You are about to alter the column `balance` on the `MonthlySummary` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `BigInt`.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `BigInt`.
  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."MonthlySummary" ALTER COLUMN "totalIncome" DROP DEFAULT,
ALTER COLUMN "totalIncome" SET DATA TYPE BIGINT,
ALTER COLUMN "totalExpense" DROP DEFAULT,
ALTER COLUMN "totalExpense" SET DATA TYPE BIGINT,
ALTER COLUMN "balance" DROP DEFAULT,
ALTER COLUMN "balance" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "public"."Transaction" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "public"."Category"("name");
