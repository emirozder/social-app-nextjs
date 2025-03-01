"use server";
import { getDbUserId } from "@/actions/user.action";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, imageUrl: string) {
  try {
    const userId = await getDbUserId();
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
