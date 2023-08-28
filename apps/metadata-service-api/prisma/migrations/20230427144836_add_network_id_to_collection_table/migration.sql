/*
  Warnings:

  - Added the required column `network_id` to the `collection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "collection" ADD COLUMN     "network_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "collection" ADD CONSTRAINT "collection_network_id_fkey" FOREIGN KEY ("network_id") REFERENCES "network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
