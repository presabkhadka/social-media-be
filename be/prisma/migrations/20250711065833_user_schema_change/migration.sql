/*
  Warnings:

  - You are about to drop the `UserPosts` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `author` to the `Posts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserPosts" DROP CONSTRAINT "UserPosts_post_id_fkey";

-- DropForeignKey
ALTER TABLE "UserPosts" DROP CONSTRAINT "UserPosts_user_id_fkey";

-- AlterTable
ALTER TABLE "Posts" ADD COLUMN     "author" INTEGER NOT NULL;

-- DropTable
DROP TABLE "UserPosts";

-- AddForeignKey
ALTER TABLE "Posts" ADD CONSTRAINT "Posts_author_fkey" FOREIGN KEY ("author") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
