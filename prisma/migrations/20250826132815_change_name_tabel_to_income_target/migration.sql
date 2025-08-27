/*
  Warnings:

  - You are about to drop the `TargetAmount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."TargetAmount" DROP CONSTRAINT "TargetAmount_userId_fkey";

-- DropTable
DROP TABLE "public"."TargetAmount";

-- CreateTable
CREATE TABLE "public"."IncomeTarget" (
    "id" TEXT NOT NULL,
    "dailyTarget" INTEGER,
    "weeklyTarget" INTEGER,
    "monthlyTarget" INTEGER,
    "yearlyTarget" INTEGER,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncomeTarget_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."IncomeTarget" ADD CONSTRAINT "IncomeTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
