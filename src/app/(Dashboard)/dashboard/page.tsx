"use client";
import { useState } from "react";
import { PostCard } from "@/app/(Dashboard)/dashboard/components/post-card";
import { Button } from "@/components/ui/button";
import { CreatePostModal } from "./components/create-post";
import { useResourceQuery } from "@/lib/hooks/useQueryFn";
import { Post } from "@/lib/types";
import { useSession } from "next-auth/react";
import Avatar from "@/components/ui/avatar";

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const session = useSession();
  const { data: posts, isLoading } = useResourceQuery<Post[]>({
    endpoint: "/api/posts/feed",
    queryKey: ["posts"],
  });
  return (
    <main className="flex-1 p-4 sm:p-6">
      <div className="flex flex-col gap-y-6">
        <div className="bg-white rounded-lg gap-x-6 px-2 py-2 h-min sticky top-0 z-10 border-b  border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-x-2 sm:gap-x-4 w-full">
            <Avatar
              height={48}
              width={48}
              image={session.data?.user.profilePhoto || null}
              name={session.data?.user.name || "s"}
              className="shrink-0"
            />
            <span className="text-gray-500">What&apos;s on your mind?</span>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="px-6 text-nowrap"
          >
            Post Content
          </Button>
        </div>

        <div className="space-y-5">
          {isLoading ? (
            <div className="text-center py-10">
              <p>Loading posts...</p>
            </div>
          ) : posts && posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="text-center text-gray-500 py-10">
              <p>No posts to display.</p>
            </div>
          )}
        </div>
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
