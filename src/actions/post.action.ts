"use server";
import { getDbUserId } from "@/actions/user.action";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, imageUrl: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "User not found" };

    const post = await prisma.post.create({
      data: {
        content,
        image: imageUrl,
        authorId: userId,
      },
    });

    revalidatePath("/"); // This will revalidate the home page after creating a post
    return { success: true, data: post };
  } catch (error) {
    console.log("Error creating post:", error);
    return { success: false, error: "Failed to create post" };
  }
}

export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userId: true,
            user: {
              select: {
                name: true,
                username: true,
                image: true,
              },
            },
          },
          // include: {
          //   user: {
          //     select: {
          //       id: true,
          //       name: true,
          //       username: true,
          //       image: true,
          //     },
          //   },
          // },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return posts;
  } catch (error) {
    console.log("Error getting posts:", error);
    throw new Error("Failed to get posts");
  }
}

export async function toggleLike(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("Unauthenticated - User not found");

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });

    if (!post) return { success: false, error: "Post not found" };

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } else {
      // like and create notification. We only create a notification if the user who liked the post is not the author of the post.
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId,
            postId,
          },
        }),
        ...(post.authorId !== userId
          ? [
              prisma.notification.create({
                data: {
                  type: "LIKE",
                  creatorId: userId, // The user who liked the post
                  userId: post.authorId, // The author of the post
                  postId,
                },
              }),
            ]
          : []),
      ]);

      revalidatePath("/"); // This will revalidate the home page after liking a post
      return { success: true };
    }
  } catch (error) {
    console.log("Error toggling like:", error);
    return { success: false, error: "Failed to toggle like" };
  }
}

export async function createComment(postId: string, content: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "User not found" };
    if (!content)
      return { success: false, error: "Comment content is required" };

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });

    if (!post) return { success: false, error: "Post not found" };

    // create comment and create notification. We only create a notification if the user who commented on the post is not the author of the post.
    const [comment] = await prisma.$transaction(async (tx) => {
      // Create comment first
      const newComment = await tx.comment.create({
        data: {
          content,
          authorId: userId,
          postId,
        },
      });

      // Create notification if commenting on someone else's post
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            creatorId: userId,
            postId,
            commentId: newComment.id,
          },
        });
      }

      return [newComment];
    });

    revalidatePath(`/`);
    return { success: true, comment };
  } catch (error) {
    console.log("Error creating comment: ", error);
    return { success: false, error: "Failed to creating comment" };
  }
}

export async function deletePost(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "User not found" };

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });

    if (!post) return { success: false, error: "Post not found" };

    if (post.authorId === userId) {
      await prisma.post.delete({
        where: {
          id: postId,
        },
      });

      revalidatePath("/");
      return { success: true };
    } else {
      return { success: false, error: "Unauthorized - no delete permission" };
    }
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "User not found" };

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        authorId: true,
      },
    });

    if (!comment) return { success: false, error: "Comment not found" };

    if (userId === comment.authorId) {
      await prisma.comment.delete({
        where: {
          id: commentId,
        },
      });

      revalidatePath("/");
      return { success: true };
    } else {
      return { success: false, error: "Unauthorized - no delete permission" };
    }
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return { success: false, error: "Failed to delete comment" };
  }
}
