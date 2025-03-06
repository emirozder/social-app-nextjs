import { getRandomUsers } from "@/actions/user.action";
import FollowButton from "@/components/FollowButton";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

async function WhoToFollowSection() {
  const users = await getRandomUsers();
  if (users.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Who to Follow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link href={`/profile/${user.username}`}>
                  <Avatar>
                    <AvatarImage src={user.image ?? "/avatar.png"} />
                  </Avatar>
                </Link>
                <div className="text-sm">
                  <Link
                    href={`/profile/${user.username}`}
                    className="font-medium cursor-pointer"
                  >
                    {user.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
              </div>
              <FollowButton userId={user.id} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default WhoToFollowSection;
