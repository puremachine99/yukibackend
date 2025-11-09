/*
  Warnings:

  - A unique constraint covering the columns `[sellerId]` on the table `SellerBalance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SellerBalance_sellerId_key" ON "SellerBalance"("sellerId");
