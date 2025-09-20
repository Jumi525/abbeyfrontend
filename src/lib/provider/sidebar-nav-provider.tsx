"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Home, Users, CircleAlert, Loader } from "lucide-react";
import { Header } from "@/components/layout/header";
import Link from "next/link";
import { cn, formatNumber } from "../utils";
import { Session } from "next-auth";
import { UserProfile } from "../types";
import { useResourceQuery } from "../hooks/useQueryFn";
import Avatar from "@/components/ui/avatar";

type SideBarProps = {
  children: React.ReactNode;
  session: Session | null;
};

export function SidebarNavProvider({ children, session }: SideBarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const { data: info, isLoading } = useResourceQuery<UserProfile>({
    endpoint: "/api/users/me",
    queryKey: ["userinfo"],
  });

  const { data: notification } = useResourceQuery<{ count: number }>({
    endpoint: "/api/notifications",
    queryKey: ["notification"],
  });

  const navigation = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "My Network", href: "/network", icon: Users },
  ];
  console.log(notification, "notify");
  const isActive = (href: string) => pathname === href;
  const isHome = pathname === "/";

  if (isHome) {
    return (
      <section className="grid grid-rows-[64px_1fr] overflow-hidden h-full">
        <div className="h-[64px] w-full">
          <Header
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            isHome={isHome}
            session={session}
            notify={notification?.count || 0}
          />
        </div>
        {children}
      </section>
    );
  }

  return (
    <section className="grid grid-rows-[64px_1fr] overflow-hidden h-screen">
      <div className="h-[64px] w-full">
        <Header
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          isHome={isHome}
          session={session}
          notify={notification?.count || 0}
        />
      </div>

      {isLoading ? (
        <div className="h-50% w-full flex items-center justify-between">
          <Loader className="mx-auto h-11 w-11 text-sky-500 animate-spin" />
        </div>
      ) : info ? (
        <div
          className={cn("grid overflow-hidden h-full relative", {
            "lg:grid-cols-[320px_1fr]": !isHome,
          })}
        >
          <aside
            className={`absolute h-full inset-y-0 left-0 z-30 w-80 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out ${
              isOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 lg:sticky lg:top-0 lg:h-auto `}
          >
            <div className="p-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 text-lg rounded-full font-bold bg-blue-400 flex items-center justify-center">
                    <Avatar
                      height={48}
                      width={48}
                      image={info.profilePhoto || null}
                      name={info.name || "s"}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{info.name}</h3>
                    <p className="text-sm text-gray-600">{info.email}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatNumber(info?._count.connections)}
                    </p>
                    <p className="text-xs text-gray-600">Connections</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatNumber(info?._count.followers)}
                    </p>
                    <p className="text-xs text-gray-600">Followers</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatNumber(info?._count.following)}
                    </p>
                    <p className="text-xs text-gray-600">Following</p>
                  </div>
                </div>
              </div>

              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-8 p-6 bg-gray-50 rounded-xl shadow-sm">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  Your Statistics
                </h4>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Post</span>
                    <span className="text-lg font-semibold text-gray-800">
                      {formatNumber(info._count.posts)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Notification</span>
                    <span className="text-lg font-semibold text-gray-800">
                      {formatNumber(info._count.Notification)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
          <div className="overflow-y-auto bg-blue-100">{children}</div>
        </div>
      ) : (
        <div className="mx-auto flex-nowrap flex items-center justify-between gap-x-3 text-red-400">
          <CircleAlert /> <p>No User Info</p>
        </div>
      )}
    </section>
  );
}
