/*
  Warnings:

  - You are about to drop the `UserFriendRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserFriendship` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserFriendRequest" DROP CONSTRAINT "UserFriendRequest_senderId_fkey";

-- DropForeignKey
ALTER TABLE "UserFriendship" DROP CONSTRAINT "UserFriendship_friendId_fkey";

-- DropTable
DROP TABLE "UserFriendRequest";

-- DropTable
DROP TABLE "UserFriendship";

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
