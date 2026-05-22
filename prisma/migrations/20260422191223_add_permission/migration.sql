-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('VIEW_DASHBOARD', 'MANAGE_PRODUCTS', 'MANAGE_CATEGORIES', 'MANAGE_WAREHOUSES', 'MANAGE_STOCK', 'MANAGE_SUPPLIERS', 'MANAGE_CUSTOMERS', 'MANAGE_SALES', 'MANAGE_PURCHASES');

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" "Permission" NOT NULL,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_userId_permission_key" ON "UserPermission"("userId", "permission");

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
