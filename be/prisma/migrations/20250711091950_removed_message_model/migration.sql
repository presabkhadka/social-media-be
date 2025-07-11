/*
  Warnings:

  - You are about to drop the `Messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserMessage" DROP CONSTRAINT "UserMessage_message_id_fkey";

-- DropForeignKey
ALTER TABLE "UserMessage" DROP CONSTRAINT "UserMessage_user_id_fkey";

-- DropTable
DROP TABLE "Messages";

-- DropTable
DROP TABLE "UserMessage";
