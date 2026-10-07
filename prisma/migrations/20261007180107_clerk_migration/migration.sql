-- AlterTable
ALTER TABLE "User" ADD COLUMN "adminUnlockedUntil" DATETIME;
ALTER TABLE "User" ADD COLUMN "clerkId" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Session";
PRAGMA foreign_keys=on;

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
