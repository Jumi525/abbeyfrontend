"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useResourceMutation } from "@/lib/hooks/useMutationFn";
import { UserProfile } from "@/lib/types";
import { Modal } from "./modal";
import MessageToast from "./message-toast";
interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export function ProfileEditModal({
  isOpen,
  onClose,
  user,
}: ProfileEditModalProps) {
  const [name, setName] = useState(user.name);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bio, setBio] = useState(user.bio || "");
  const updateProfileMutation = useResourceMutation(`/api/users/me`, "PATCH", {
    extraKeys: [["users"]],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(
      {
        name,
        bio,
      },
      {
        onSuccess: () => {
          setSuccess("User updated successfully! 🎉");
          setTimeout(() => {
            onClose();
            setSuccess("");
            setError("");
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
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full h-full p-4 sm:p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="headline" className="text-right">
              email
            </label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <label htmlFor="bio" className="text-right">
              Bio
            </label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="col-span-3"
            />
          </div>
          <MessageToast error={error} success={success} />
          <Button
            type="submit"
            className="w-full"
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </Modal>
  );
}
