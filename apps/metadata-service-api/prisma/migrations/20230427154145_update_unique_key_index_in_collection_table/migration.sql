/*
  Warnings:

  - A unique constraint covering the columns `[network_id,address]` on the table `collection` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "collection_address_key";

-- CreateIndex
CREATE UNIQUE INDEX "collection_network_id_address_key" ON "collection"("network_id", "address");
