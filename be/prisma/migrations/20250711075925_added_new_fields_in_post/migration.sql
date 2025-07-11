/*
  Warnings:

  - Added the required column `body` to the `Posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Posts" ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "likes" DROP NOT NULL,
ALTER COLUMN "likes" SET DEFAULT 0,
ALTER COLUMN "comment" DROP NOT NULL;
