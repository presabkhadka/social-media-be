/*
  Warnings:

  - You are about to drop the column `user1` on the `Friendship` table. All the data in the column will be lost.
  - You are about to drop the column `user2` on the `Friendship` table. All the data in the column will be lost.
  - Added the required column `user1Id` to the `Friendship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user2Id` to the `Friendship` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Friendship" DROP COLUMN "user1",
DROP COLUMN "user2",
ADD COLUMN     "user1Id" INTEGER NOT NULL,
ADD COLUMN     "user2Id" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
