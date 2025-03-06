"use client";
import {
  getNotifications,
  markNotificationsAsRead,
} from "@/actions/notification.action";
import { NotificationsSkeleton } from "@/components/NotificationsSkeleton";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { HeartIcon, MessageCircleIcon, UserPlusIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type MergedNotificationType = Awaited<ReturnType<typeof getNotifications>>[0];

function NotificationsPage() {
  const [notifications, setNotifications] = useState<MergedNotificationType[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const notifications = await getNotifications();
      setNotifications(notifications);

      const unreadNotificationIds = notifications
        .filter((n) => !n.read)
        .map((n) => n.id);
      if (unreadNotificationIds.length > 0) {
        // Mark notifications as read
        await markNotificationsAsRead(unreadNotificationIds);
      }
    } catch (error) {
      toast.error("Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (isLoading) return <NotificationsSkeleton />;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row justify-between items-center">
          <p className="text-lg font-bold">Notifications</p>
          <p className="text-sm text-muted-foreground">
            {notifications.filter((n) => !n.read).length} unread
          </p>
        </div>
      </CardHeader>
      <div className="border"></div>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-14rem)]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              There are no notifications to show
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex space-x-3 border-b p-4 hover:bg-muted/25 transition-colors ${
                  !notification.read ? "bg-muted-foreground/15" : ""
                }`}
              >
                <Link href={`profile/${notification.creator.username}`}>
                  <Avatar className="size-10 rounded-full">
                    <AvatarImage
                      src={notification.creator.image ?? "/avatar.png"}
                    />
                  </Avatar>
                </Link>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:space-x-2 sm:items-center h-fit">
                    <div className="flex space-x-2 items-center">
                      {
                        {
                          FOLLOW: (
                            <UserPlusIcon className="size-4 text-green-500" />
                          ),
                          LIKE: <HeartIcon className="size-4 text-red-500" />,
                          COMMENT: (
                            <MessageCircleIcon className="size-4 text-blue-500" />
                          ),
                        }[notification.type]
                      }
                      <Link href={`profile/${notification.creator.username}`}>
                        <p className="font-semibold">
                          {notification.creator.name}
                        </p>
                      </Link>
                    </div>
                    <div className="flex space-x-2 items-center">
                      <p className="text-muted-foreground">
                        {
                          {
                            FOLLOW: "started following you",
                            LIKE: "liked your post",
                            COMMENT: "commented on your post",
                          }[notification.type]
                        }
                      </p>
                      <span>•</span>
                      <p className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  {notification.post &&
                    (notification.type === "LIKE" ||
                      notification.type === "COMMENT") && (
                      <div className="pl-0 space-y-2">
                        <div className="text-sm text-muted-foreground rounded-md p-2 bg-muted/60 mt-2">
                          <p>{notification.post.content}</p>
                          {notification.post.image && (
                            <img
                              src={notification.post.image}
                              alt="Post content"
                              className="mt-2 rounded-md w-full max-w-[200px] h-auto object-cover"
                            />
                          )}
                        </div>

                        {notification.type === "COMMENT" &&
                          notification.comment && (
                            <div className="text-sm p-2 bg-accent/80 rounded-md flex gap-1 items-center">
                              <MessageCircleIcon className="size-4 " />
                              {notification.comment.content}
                            </div>
                          )}
                      </div>
                    )}
                </div>

                {/* {notification.post?.image && (
                  <Image
                    src={notification.post.image ?? "/placeholder.jpg"}
                    alt="Post image"
                    width={50}
                    height={50}
                    className="rounded-md"
                  />
                )} */}
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default NotificationsPage;
