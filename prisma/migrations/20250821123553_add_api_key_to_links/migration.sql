-- AlterTable
ALTER TABLE "public"."Link" ADD COLUMN     "api_key_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Link" ADD CONSTRAINT "Link_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "public"."ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
