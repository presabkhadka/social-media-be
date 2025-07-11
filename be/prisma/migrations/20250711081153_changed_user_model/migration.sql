/*
  Warnings:

  - You are about to drop the column `isLiked` on the `Posts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Posts" DROP COLUMN "isLiked";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "likedPost" INTEGER[];
