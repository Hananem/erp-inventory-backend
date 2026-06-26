/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "frozen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reference" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "AccountType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Account_reference_key" ON "Account"("reference");
