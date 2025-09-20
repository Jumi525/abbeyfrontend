"use client";
import { useState } from "react";
import { Image, Video, Calendar, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { useResourceMutation } from "@/lib/hooks/useMutationFn";
import MessageToast from "@/components/ui/message-toast";
import { useSession } from "next-auth/react";
import Avatar from "@/components/ui/avatar";

type CreatePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const session = useSession();
  const createPost = useResourceMutation("/api/posts", "POST", {
    queryKey: ["post-content"],
    extraKeys: [["posts"]],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (content.trim()) {
      createPost.mutate(
        { content, media: [] },
        {
          onSuccess: () => {
            setSuccess("Post Created successfully! 🎉");
            setTimeout(() => {
              onClose();
              setSuccess("");
              setError("");
              setContent("");
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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start gap-x-4">
            <Avatar
              height={48}
              width={48}
              image={session.data?.user.image || null}
              name={session.data?.user.name || "s"}
            />
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] outline outline-blue-300 resize-none border-none shadow-none text-lg placeholder:text-gray-500 focus-visible:ring-0"
              />
            </div>
          </div>
          <MessageToast success={success} error={error} className="mt-2" />
          <div className="mt-4 flex items-center gap-2.5 justify-between flex-wrap">
            <div className="flex items-center gap-x-4 gap-y-2 flex-wrap">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 border border-blue-200 rounded-full text-gray-600 hover:text-blue-600"
              >
                <div className="w-4 h-4" />
                <span>Photo</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 border border-blue-200 rounded-full text-gray-600 hover:text-blue-600"
              >
                <Video className="w-4 h-4" />
                <span>Video</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 border border-blue-200 rounded-full text-gray-600 hover:text-blue-600"
              >
                <Calendar className="w-4 h-4" />
                <span>Event</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 border border-blue-200 rounded-full text-gray-600 hover:text-blue-600"
              >
                <Smile className="w-4 h-4" />
                <span>Feeling</span>
              </Button>
            </div>
            <Button type="submit" disabled={!content.trim()} className="px-6">
              Post Content
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
