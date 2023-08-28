-- CreateEnum
CREATE TYPE "CollectionType" AS ENUM ('ERC721', 'ERC1155');

-- CreateTable
CREATE TABLE "network" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,
    "currency_address" VARCHAR(42) NOT NULL,

    CONSTRAINT "network_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currency" (
    "id" SERIAL NOT NULL,
    "address" CHAR(42) NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet" (
    "id" SERIAL NOT NULL,
    "address" CHAR(42) NOT NULL,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection" (
    "id" SERIAL NOT NULL,
    "type" "CollectionType" NOT NULL,
    "owner_wallet_id" INTEGER NOT NULL,
    "is_explicit" BOOLEAN,
    "is_verified" BOOLEAN,
    "address" CHAR(42) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "symbol" TEXT,
    "logo" TEXT,
    "banner" TEXT,
    "website_link" TEXT,
    "twitter_link" TEXT,
    "os_slug" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token" (
    "id" SERIAL NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "tokenid" DECIMAL(78,0) NOT NULL,
    "flag_id" INTEGER NOT NULL,
    "is_animated" BOOLEAN,
    "token_uri" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "refresh_requested_at" TIMESTAMP(3),
    "refresh_executed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "event_block" BIGINT,

    CONSTRAINT "token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_owner" (
    "token_id" INTEGER NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "wallet_id" INTEGER NOT NULL,
    "balance" DECIMAL(78,0) NOT NULL,

    CONSTRAINT "token_owner_pkey" PRIMARY KEY ("token_id","wallet_id")
);

-- CreateTable
CREATE TABLE "attribute" (
    "id" SERIAL NOT NULL,
    "trait_type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "display_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "attribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_attribute" (
    "collection_id" INTEGER NOT NULL,
    "token_id" INTEGER NOT NULL,
    "attribute_id" INTEGER NOT NULL,

    CONSTRAINT "token_attribute_pkey" PRIMARY KEY ("token_id","attribute_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "network_name_key" ON "network"("name");

-- CreateIndex
CREATE UNIQUE INDEX "currency_address_key" ON "currency"("address");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_address_key" ON "wallet"("address");

-- CreateIndex
CREATE UNIQUE INDEX "collection_address_key" ON "collection"("address");

-- CreateIndex
CREATE INDEX "token_created_at_id_idx" ON "token"("created_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "token_collection_id_tokenid_key" ON "token"("collection_id", "tokenid");

-- CreateIndex
CREATE INDEX "token_owner_collection_id_wallet_id_idx" ON "token_owner"("collection_id", "wallet_id");

-- CreateIndex
CREATE INDEX "token_owner_collection_id_token_id_wallet_id_idx" ON "token_owner"("collection_id", "token_id", "wallet_id");

-- CreateIndex
CREATE INDEX "attribute_trait_type_idx" ON "attribute"("trait_type");

-- CreateIndex
CREATE UNIQUE INDEX "attribute_trait_type_value_key" ON "attribute"("trait_type", "value");

-- AddForeignKey
ALTER TABLE "network" ADD CONSTRAINT "network_currency_address_fkey" FOREIGN KEY ("currency_address") REFERENCES "currency"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection" ADD CONSTRAINT "collection_owner_wallet_id_fkey" FOREIGN KEY ("owner_wallet_id") REFERENCES "wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token" ADD CONSTRAINT "token_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_owner" ADD CONSTRAINT "token_owner_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_owner" ADD CONSTRAINT "token_owner_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_owner" ADD CONSTRAINT "token_owner_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_attribute" ADD CONSTRAINT "token_attribute_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_attribute" ADD CONSTRAINT "token_attribute_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_attribute" ADD CONSTRAINT "token_attribute_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
