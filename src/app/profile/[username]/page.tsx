import {
  getLikedPostsByUserId,
  getPostsByUserId,
  getProfileByUsername,
  isFollowingUser,
} from "@/actions/profile.action";
import ProfilePageClient from "@/app/profile/[username]/ProfilePageClient";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}) {
  const user = await getProfileByUsername(params.username);
  if (!user) return;

  return {
    title: `Profile | ${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
}

async function ProfilePage({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);

  if (!user) notFound();

  const posts = await getPostsByUserId(user.id);
  const likedPosts = await getLikedPostsByUserId(user.id);
  const isCurrentUserFollowing = await isFollowingUser(user.id);

  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isCurrentUserFollowing}
    />
  );
}

export default ProfilePage;
