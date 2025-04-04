"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return;

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (existingUser) return existingUser;

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name:
          user.fullName ?? user.username ?? user.emailAddresses[0].emailAddress,
        // name: `${user.firstName || ""} ${user.lastName || ""}`,
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress ?? "email@example.com",
        image: user.imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.log("Error syncing user:", error);
  }
}

export async function getUserByClerkId(clerkId: string) {
  await syncUser();
  const dbUser = await prisma.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });

  if (!dbUser) throw new Error("User not found in database");

  return dbUser;
}

export async function getDbUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error("User not found");

  // update the user image if it has changed in Clerk
  try {
    const clerkUser = await currentUser();
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        image: clerkUser?.imageUrl,
      },
    });

    revalidatePath("/");
  } catch (error) {
    console.log("Error updating user image:", error);
  }

  return user.id;
}

export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();

    if (!userId) return [];

    // Get 3 random users excluding the current user and users the current user is already following
    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          {
            NOT: {
              id: userId,
            },
          },
          {
            NOT: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
      },
      take: 3,
    });

    return randomUsers;
  } catch (error) {
    console.log("Error getting random users:", error);
    return [];
  }
}

export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    if (userId === targetUserId) throw new Error("You cannot follow yourself");

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });

      // Revalidate the home page after unfollowing a user
      revalidatePath("/");

      return {
        success: true,
        message: "User unfollowed successfully",
        following: false,
      };
    } else {
      // Follow
      // Transaction allows us to perform multiple operations in a single call. This is useful for operations that depend on each other. For example, when following a user, we need to create a follow record and a notification record.
      // If one operation fails, the entire transaction is rolled back. This ensures data integrity. If both operations succeed, the transaction is committed.
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),
        prisma.notification.create({
          data: {
            type: "FOLLOW",
            creatorId: userId, // The user who followed
            userId: targetUserId, // The user who was followed
          },
        }),
      ]);

      // Revalidate the home page after following a user
      revalidatePath("/");

      return {
        success: true,
        message: "User followed successfully",
        following: true,
      };
    }
  } catch (error) {
    console.log("Error toggling follow:", error);
    return { success: false, error: "Failed to toggle follow" };
  }
}
