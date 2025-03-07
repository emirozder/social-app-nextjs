import { getUserByClerkId } from "@/actions/user.action";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import UnAuthenticatedSidebar from "@/components/UnAuthenticatedSidebar";
import { currentUser } from "@clerk/nextjs/server";
import { LinkIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";

async function Sidebar() {
  const authUser = await currentUser();
  if (!authUser) return <UnAuthenticatedSidebar />;

  // Get the user from the database. Not from Clerk because we need more data about the user such as followers, following, bio, location etc...
  const user = await getUserByClerkId(authUser.id);
  if (!user) return null;

  return (
    <div className="sticky top-24">
      <Card>
        <CardContent className="flex flex-col items-center text-center pt-6">
          <Link
            href={`/profile/${user.username}`}
            className="flex flex-col items-center justify-center"
          >
            <Avatar className="size-20 border-2">
              <AvatarImage src={user.image || "/avatar.png"} />
            </Avatar>

            <div className="mt-2">
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </Link>

          {user.bio && (
            <p className="mt-3 text-sm text-muted-foreground">{user.bio}</p>
          )}

          <div className="w-full">
            <Separator className="my-4" />
            <div className="flex justify-between">
              <div className="w-full">
                <p className="font-medium">{user._count.followers}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="w-full">
                <p className="font-medium">{user._count.following}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
            </div>
            <Separator className="my-4" />
          </div>

          <div className="w-full space-y-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <MapPinIcon className="size-4 mr-2" />
              {user.location || "No location"}
            </div>
            <div className="flex items-center text-muted-foreground">
              <LinkIcon className="size-4 mr-2 shrink-0" />
              {user.website ? (
                <a
                  href={
                    user.website.startsWith("http")
                      ? user.website
                      : `http://${user.website}`
                  }
                  className="hover:underline truncate"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {user.website}
                </a>
              ) : (
                "No website"
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Sidebar;
