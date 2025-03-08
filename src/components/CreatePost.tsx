"use client";

import { createPost } from "@/actions/post.action";
import ImageUpload from "@/components/ImageUpload";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { ImageIcon, Loader2Icon, SendIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function CreatePost() {
  const { user } = useUser();
  const [content, setContent] = useState(""); // Post content
  const [imageUrl, setImageUrl] = useState(""); // Post image URL
  const [isPosting, setIsPosting] = useState(false); // Post loading state
  const [showImageUpload, setShowImageUpload] = useState(false); // Show image preview section state

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return;
    setIsPosting(true);
    try {
      const res = await createPost(content, imageUrl);
      if (res.success) {
        setContent("");
        setImageUrl("");
        setShowImageUpload(false);
        toast.success("Post created successfully");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        {/* <div className="space-y-4"> */}
        <div className="flex space-x-4">
          <Avatar className="size-10">
            <AvatarImage src={user?.imageUrl || "/avatar.png"} />
          </Avatar>

          <Textarea
            className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-0"
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPosting}
          />
        </div>

        {(showImageUpload || imageUrl) && (
          <div className="border rounded-lg p-4">
            <ImageUpload
              endpoint="postImage"
              value={imageUrl}
              onChange={(url) => {
                setImageUrl(url);
                if (!url) setShowImageUpload(false);
              }}
            />
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setShowImageUpload(!showImageUpload)}
            disabled={isPosting}
          >
            <ImageIcon className="size-4" />
            Photo
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={(!content.trim() && !imageUrl) || isPosting}
            size="sm"
          >
            {isPosting ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <SendIcon className="size-4" />
                Post
              </>
            )}
          </Button>
          {/* </div> */}
        </div>
      </CardContent>
    </Card>
  );
}

export default CreatePost;
