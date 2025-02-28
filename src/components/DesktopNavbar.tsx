import ToggleTheme from "@/components/ToggleTheme";
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { BellIcon, HomeIcon, UserIcon } from "lucide-react";
import Link from "next/link";

async function DesktopNavbar() {
  const user = await currentUser();

  return (
    <div className="hidden md:flex items-center space-x-4">
      <ToggleTheme />

      <Button variant="ghost">
        <Link href="/" className="flex items-center justify-center gap-2">
          <HomeIcon className="size-4" />
          <span className="hidden lg:block">Home</span>
        </Link>
      </Button>

      {user ? (
        <>
          <Button variant="ghost">
            <Link
              href="/notifications"
              className="flex items-center justify-center gap-2"
            >
              <BellIcon className="size-4" />
              <span className="hidden lg:block">Notifications</span>
            </Link>
          </Button>

          <Button variant="ghost">
            <Link
              href={`/profile/${
                user.username ??
                user.emailAddresses[0].emailAddress.split("@")[0]
              }`}
              className="flex items-center justify-center gap-2"
            >
              <UserIcon className="size-4" />
              <span className="hidden lg:block">Profile</span>
            </Link>
          </Button>

          <UserButton />
        </>
      ) : (
        <SignInButton mode="modal">
          <Button variant="default">Sign In</Button>
        </SignInButton>
      )}
    </div>
  );
}

export default DesktopNavbar;
