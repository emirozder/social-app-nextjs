"use client";
import { toggleFollow } from "@/actions/user.action";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function FollowButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [followState, setFollowState] = useState("Follow");

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      const res = await toggleFollow(userId);
      toast.success(res?.message);
      setFollowState(res?.following ? "Unfollow" : "Follow");
    } catch (error) {
      console.log("Error following user:", error);
      toast.error("Failed to follow user");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button
      size={"sm"}
      variant={followState === "Follow" ? "secondary" : "destructive"}
      onClick={handleFollow}
      disabled={isLoading}
      className="w-20"
    >
      {isLoading ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        followState
      )}
    </Button>
  );
}

export default FollowButton;
