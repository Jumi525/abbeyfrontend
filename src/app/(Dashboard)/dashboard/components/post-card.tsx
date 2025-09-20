"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Post } from "@/lib/types";
import Image from "next/image";
import { cn, formatNumber } from "@/lib/utils";
import Avatar from "../../../../components/ui/avatar";
import { useResourceMutation } from "@/lib/hooks/useMutationFn";
import { useSession } from "next-auth/react";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const user = useSession();
  const [shares, setShares] = useState("");
  const [error, setError] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const likeFeed = useResourceMutation(`/api/posts/like`, "POST", {
    queryKey: ["like"],
    extraKeys: [["posts"]],
  });

  const commentFeed = useResourceMutation(
    `/api/posts/comment/${post.id}`,
    "POST",
    {
      queryKey: ["comment"],
      extraKeys: [["posts"]],
    }
  );

  const handleLike = (postId: string) => {
    likeFeed.mutate({ postId });
  };

  const handleShare = () => {
    setShares(shares + 1);

    const postLink = `${window.location.origin}/posts/${post.id}`;
    navigator.clipboard.writeText(postLink).then(() => {
      alert("Post link copied to clipboard!");
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    setError("");
    e.preventDefault();
    if (newComment.trim()) {
      commentFeed.mutate(
        { text: newComment },
        {
          onSuccess: () => {
            setTimeout(() => {
              setNewComment("");
              setShowComments(false);
            }, 1000);
          },
          onError: (err) => {
            const errorMessage =
              err instanceof Error
                ? err.message
                : "❌ An unexpected error occurred.";
            setError(errorMessage);
          },
        }
      );
    }
  };

  const validImages = post.media.filter(Boolean);
  const imageCount = validImages.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar
            height={48}
            width={48}
            image={post.author.profilePhoto || null}
            name={post.author.name}
          />
          <div>
            <h3 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
              {post.author.name}
            </h3>
            <p className="text-sm text-gray-600">{post.author.email}</p>
            <p className="text-xs text-gray-500">{post.createdAt}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed">{post.content}</p>
        {imageCount > 0 && (
          <div
            className={`mt-4 grid gap-1 ${
              imageCount >= 3 ? "grid-cols-2" : "grid-cols-1"
            }`}
          >
            {validImages.slice(0, 4).map((imageUrl, index) => {
              const isLastOfFour = index === 3 && imageCount > 4;

              return (
                <div
                  key={index}
                  className={`relative w-full h-48 sm:h-64 md:h-80 lg:h-96 ${
                    imageCount === 1 ? "col-span-2" : ""
                  }`}
                >
                  <Image
                    // src={imageUrl}
                    src={
                      "https://lh3.googleusercontent.com/a/ACg8ocI48_LUPW0itnVRgVb1eHdhtvmuFE0xWvfzlJKFWM8didBYtQIN=s96-c"
                    }
                    alt={`Post image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />

                  {isLastOfFour && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <span className="text-white text-2xl font-semibold">
                        +{imageCount - 4}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <span>{formatNumber(post._count.likes)} likes</span>
          <span>{formatNumber(post._count.comments)} comments</span>
          <span>{shares} shares</span>
        </div>
      </div>
      {/* Post Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Button
            disabled={post.authorId === user.data?.user.id}
            variant="ghost"
            size="sm"
            onClick={() => handleLike(post.id)}
            className={`flex items-center space-x-2 ${
              likeFeed.data?.liked
                ? "text-red-600 hover:text-red-700"
                : "text-gray-600 hover:text-gray-700"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                likeFeed.data?.liked ? "fill-current" : ""
              }`}
            />
            <span>Like</span>
          </Button>
          <Button
            disabled={post.authorId === user.data?.user.id}
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Comment</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </Button>
        </div>
        <Button variant="ghost" size="icon">
          <Bookmark className="w-4 h-4" />
        </Button>
      </div>
      {showComments && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <form
            onSubmit={handleCommentSubmit}
            className="flex items-center space-x-3"
          >
            <Avatar
              height={32}
              width={32}
              image={post.author.profilePhoto || null}
              name={post.author.name}
            />

            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className={cn(
                `flex-1 p-2 text-sm rounded-lg resize-none min-h-[40px]`,
                { "outline outline-red-500": error }
              )}
            />
            <Button type="submit" size="lg" disabled={!newComment.trim()}>
              Post
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
