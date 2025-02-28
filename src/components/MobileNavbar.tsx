"use client";
import ToggleTheme from "@/components/ToggleTheme";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SignInButton, SignOutButton, useAuth } from "@clerk/nextjs";
import { BellIcon, HomeIcon, LogOutIcon, MenuIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function MobileNavbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isSignedIn = useAuth().isSignedIn;

  return (
    <div className="flex md:hidden items-center space-x-2">
      <ToggleTheme />

      {/* <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}></Sheet> */}
      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <MenuIcon className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[300px]">
          <SheetHeader>
            <SheetTitle className="text-center">Menu</SheetTitle>

            <nav className="flex flex-col space-y-4">
              <Button variant="ghost" className="flex justify-start mt-6">
                <Link
                  href="/"
                  className="flex items-center justify-start gap-3"
                >
                  <HomeIcon className="size-4" />
                  <span>Home</span>
                </Link>
              </Button>

              {isSignedIn ? (
                <>
                  <Button variant="ghost" className="flex justify-start">
                    <Link
                      href="/notifications"
                      className="flex items-center justify-start gap-3"
                    >
                      <BellIcon className="size-4" />
                      <span>Notifications</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" className="flex justify-start">
                    <Link
                      href="/profile"
                      className="flex items-center justify-start gap-3"
                    >
                      <BellIcon className="size-4" />
                      <span>Profile</span>
                    </Link>
                  </Button>
                  <SignOutButton>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-3 justify-start w-full"
                    >
                      <LogOutIcon className="size-4" />
                      Logout
                    </Button>
                  </SignOutButton>
                </>
              ) : (
                <SignInButton mode="modal">
                  <Button variant="default" className="w-full">
                    Sign In
                  </Button>
                </SignInButton>
              )}
            </nav>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileNavbar;
