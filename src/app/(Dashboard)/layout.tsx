import { auth } from "@/lib/auth";
import { SidebarNavProvider } from "@/lib/provider/sidebar-nav-provider";
import React from "react";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  return <SidebarNavProvider session={session}>{children}</SidebarNavProvider>;
};

export default layout;
