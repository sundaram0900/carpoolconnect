
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { databaseService } from "@/lib/services/database";
import { User } from "@/lib/types";
import { getAvatarUrl } from "@/lib/utils";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

interface ProfilePictureUploadProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

const ProfilePictureUpload = ({ user, onUpdate }: ProfilePictureUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile picture must be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setIsUploading(true);
    try {
      const updatedUser = await databaseService.uploadProfilePicture(user.id, file);
      if (updatedUser) {
        onUpdate(updatedUser);
        toast.success("Profile picture updated successfully");
      } else {
        toast.error("Failed to update profile picture");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("An error occurred while uploading the profile picture");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
      
      <div className="relative group cursor-pointer mb-4" onClick={handleButtonClick}>
        <Avatar className="h-24 w-24">
          <AvatarImage src={getAvatarUrl(user)} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Upload className="h-6 w-6 text-white" />
        </div>
      </div>
      
      <Button
        onClick={handleButtonClick}
        variant="outline"
        size="sm"
        className="text-xs"
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-3 w-3 mr-1" />
            Upload Photo
          </>
        )}
      </Button>
    </div>
  );
};

export default ProfilePictureUpload;
