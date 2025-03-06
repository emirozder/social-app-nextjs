"use client";
import {
  createComment,
  deleteComment,
  deletePost,
  getPosts,
  toggleLike,
} from "@/actions/post.action";
import DeleteCommentModal from "@/components/DeleteCommentModal";
import DeletePostModal from "@/components/DeletePostModal";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SignInButton, useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import {
  HeartIcon,
  Loader2,
  LogInIcon,
  MessageCircleIcon,
  SendIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type MergedPostType = Awaited<ReturnType<typeof getPosts>>[0]; // This is the type of the post object that we get from the server. It includes the author, comments, likes and counts. It is a merged type of the post object and its relations.
interface PostCardProps {
  post: MergedPostType;
  dbUserId: string | null;
}

function PostCard({ post, dbUserId }: PostCardProps) {
  // console.log("Post:", post);

  const user = useUser();
  const [newCommentText, setNewCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isDeletingCommentId, setIsDeletingCommentId] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false); // Check if the user has liked the post by checking if there is a like object with the user's id in the likes array.
  const [optimisticLikes, setOptimisticLikes] = useState(post._count.likes); // We store the number of likes in a state so that we can update it optimistically. This will make the UI feel more responsive. We will update this state when the user likes or unlikes a post. We will also update it when the server responds with the new number of likes.
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user.isSignedIn) {
      setHasLiked(post.likes.some((like) => like.userId === dbUserId));
    }
  }, [user.isSignedIn, dbUserId, post.likes]);

  const handleAddComment = async () => {
    if (!newCommentText.trim() || isCommenting) return;

    try {
      setIsCommenting(true);
      const res = await createComment(post.id, newCommentText.trim());
      if (res?.success) {
        toast.success("Comment posted successfully");
        setNewCommentText("");
      } else {
        toast.error(`${res?.error}`);
      }
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;

    try {
      setIsLiking(true);
      setHasLiked((prev) => !prev);
      setOptimisticLikes((prev) => prev + (hasLiked ? -1 : 1));
      await toggleLike(post.id);
    } catch (error) {
      setOptimisticLikes(post._count.likes); // If there is an error, we revert the optimistic update.
      setHasLiked(post.likes.some((like) => like.userId === dbUserId));
    } finally {
      setIsLiking(false);
    }
  };

  const handleDeletePost = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      const res = await deletePost(post.id);
      if (res?.success) {
        toast.success("Post deleted successfully");
      } else {
        toast.error(`${res?.error}`);
      }
    } catch (error) {
      toast.error("Failed to deleting post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (isDeletingCommentId === commentId) return;
    try {
      setIsDeletingCommentId(commentId);

      const res = await deleteComment(commentId);
      if (res?.success) {
        toast.success("Comment deleted successfully");
      } else {
        toast.error(`${res?.error}`);
      }
    } catch (error) {
      toast.error("Failed to deleting comment");
    } finally {
      setIsDeletingCommentId("");
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* HEADER */}
          <div className="flex space-x-3">
            <Link href={`profile/${post.author.username}`}>
              <Avatar className="size-10 rounded-full">
                <AvatarImage src={post.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                  <Link
                    href={`profile/${post.author.username}`}
                    className="font-semibold truncate"
                  >
                    {post.author.name}
                  </Link>

                  <div className="flex space-x-2 text-sm text-muted-foreground truncate">
                    <Link href={`profile/${post.author.username}`}>
                      @{post.author.username}
                    </Link>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(post.createdAt))} ago
                    </span>
                  </div>
                </div>

                {/* TOGGLE DELETE MODAL BUTTON */}
                {post.authorId === dbUserId && (
                  <DeletePostModal
                    title="Delete Post"
                    description="Are you sure you want to delete this post?"
                    onDelete={handleDeletePost}
                    isDeleting={isDeleting}
                  />
                )}
              </div>

              {/* CONTENT TEXT */}
              <p className="mt-3 text-sm text-foreground break-words">
                {post.content}
              </p>
            </div>
          </div>

          {/* CONTENT IMAGE*/}
          {post.image && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={post.image}
                alt="Post content"
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* LIKES AND COMMENT BUTTONS */}
          <div className="flex gap-4 border-y py-3">
            {user.isSignedIn ? (
              <Button
                variant="outline"
                size="sm"
                className={`text-muted-foreground gap-2 ${
                  hasLiked
                    ? "text-red-500 hover:text-red-600"
                    : "hover:text-red-500"
                }`}
                onClick={handleLike}
              >
                {hasLiked ? (
                  <HeartIcon className="size-5 fill-red-500" />
                ) : (
                  <HeartIcon className="size-5" />
                )}
                <span className="text-muted-foreground">{optimisticLikes}</span>
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground gap-2"
                >
                  <HeartIcon className="size-5" />
                  <span>{optimisticLikes}</span>
                </Button>
              </SignInButton>
            )}

            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground gap-2 hover:text-blue-500"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircleIcon className="size-5" />
              <span className="text-muted-foreground">
                {post._count.comments}
              </span>
            </Button>
          </div>

          {/* COMMENTS SECTION */}
          {showComments && (
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <div className="flex space-x-3" key={comment.id}>
                  <Link href={`profile/${comment.author.username}`}>
                    <Avatar className="size-8 rounded-full">
                      <AvatarImage
                        src={comment.author.image ?? "/avatar.png"}
                      />
                    </Avatar>
                  </Link>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                        <Link
                          href={`profile/${comment.author.username}`}
                          className="font-semibold truncate text-sm"
                        >
                          {comment.author.name}
                        </Link>

                        <div className="flex space-x-2 text-xs text-muted-foreground truncate">
                          <Link href={`profile/${comment.author.username}`}>
                            {comment.author.username}
                          </Link>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(comment.createdAt))}{" "}
                            ago
                          </span>
                        </div>
                      </div>

                      {/* TOGGLE DELETE COMMENT BUTTON */}
                      {comment.authorId === dbUserId && (
                        <DeleteCommentModal
                          title="Delete Comment"
                          description="Are you sure you want to delete this comment?"
                          onDelete={() => handleDeleteComment(comment.id)}
                          isDeletingCommentId={isDeletingCommentId}
                          commentId={comment.id}
                        />
                      )}
                    </div>

                    {/* CONTENT TEXT */}
                    <p className="text-sm text-foreground break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}

              {user.isSignedIn ? (
                <div className="flex space-x-2">
                  <Avatar className="size-8 rounded-full">
                    <AvatarImage src={user.user.imageUrl ?? "/avatar.png"} />
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      disabled={isCommenting}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex mt-2 justify-end">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleAddComment}
                        disabled={!newCommentText.trim() || isCommenting}
                      >
                        {isCommenting ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <SendIcon className="size-4" />
                            Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center p-4 border rounded-lg bg-muted/50 mt-4">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="gap-2">
                      <LogInIcon className="size-4" />
                      Sign in to comment
                    </Button>
                  </SignInButton>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PostCard;
