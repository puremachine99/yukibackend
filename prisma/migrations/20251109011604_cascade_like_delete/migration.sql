-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_itemId_fkey";

-- DropIndex
DROP INDEX "Like_userId_itemId_key";

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
