-- CreateTable
CREATE TABLE "public"."TargetAmount" (
    "id" TEXT NOT NULL,
    "dailyTarget" INTEGER,
    "weeklyTarget" INTEGER,
    "monthlyTarget" INTEGER,
    "yearlyTarget" INTEGER,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TargetAmount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."TargetAmount" ADD CONSTRAINT "TargetAmount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
