import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
type AvatarProps = {
  image: string | null;
  name: string;
  className?: string;
  width: number;
  height: number;
};
const Avatar = ({ image, name, className, height, width }: AvatarProps) => {
  return (
    <div
      className={cn(
        "w-12 h-12 text-lg rounded-full font-bold bg-blue-400 flex items-center justify-center",
        className
      )}
    >
      {image ? (
        <Image
          width={width}
          height={height}
          src={image}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );
};

export default Avatar;
