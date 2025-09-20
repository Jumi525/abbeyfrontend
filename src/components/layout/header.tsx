"use client";

import { Dispatch, SetStateAction, useState } from "react";
import Link from "next/link";
import { Search, Bell, LogOut, Menu, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Session } from "next-auth";
import { logoutAction } from "@/app/action/signout";
import { ProfileEditModal } from "../ui/profile-edit-modal";
import { UserProfile } from "@/lib/types";
import Avatar from "../ui/avatar";

type HeaderProps = {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
  isHome: boolean;
  session: Session | null;
  notify: number;
};

export function Header({
  setIsOpen,
  isOpen,
  isHome,
  session,
  notify,
}: HeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [editProfile, setEditProfile] = useState(false);

  const handleEditProfileClick = () => {
    setIsProfileMenuOpen(false);
    setEditProfile(true);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SP</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              SocialPro
            </span>
          </Link>

          {!isHome && (
            <div className="flex-1 max-w-lg mx-8 hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search people, companies, posts..."
                className="pl-10 w-full"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            {session?.user && (
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {notify}
                </span>
              </Button>
            )}

            <div className="relative">
              {session?.user ? (
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className=" sm:bg-gray-200 sm:pr-2 rounded-full flex items-center gap-x-2 p-1 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full font-bold bg-blue-400 place-content-center">
                    <Avatar
                      height={32}
                      width={32}
                      image={session?.user?.profilePhoto || null}
                      name={session?.user.name || "s"}
                      className="h-8 w-8"
                    />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {session?.user?.name.split(" ")[0]}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-x-2">
                  <Link href="/auth/login">
                    <Button>Login</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button>Signup</Button>
                  </Link>
                </div>
              )}

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 overflow-hidden bg-white rounded-lg shadow-2xl z-50 transform origin-top-right transition-all duration-200 ease-out">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">
                      {session?.user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session?.user.email}
                    </p>
                  </div>

                  <div className="py-1 w-full">
                    <button
                      className="w-full text-left flex items-center px-4 h-11 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      onClick={handleEditProfileClick}
                    >
                      <Settings className="w-4 h-4 mr-3 text-gray-500" />
                      Edit Profile
                    </button>
                  </div>

                  <div className="py-1 border-t border-gray-100">
                    <button
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logoutAction();
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!isHome && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsOpen((prev) => !prev)}
              >
                {isOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {isProfileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}

      {editProfile && session?.user && (
        <ProfileEditModal
          isOpen={editProfile}
          onClose={() => setEditProfile(false)}
          user={session?.user as UserProfile}
        />
      )}
    </header>
  );
}
