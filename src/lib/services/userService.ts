
import { supabase, mapDbProfileToUser } from "@/integrations/supabase/client";
import { User } from "@/lib/types";

export const userService = {
  async updateUserProfile(userId: string, userData: Partial<User>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: userData.name,
          phone: userData.phone,
          bio: userData.bio,
          address: userData.address,
          city: userData.city,
          zip_code: userData.zipCode,
          avatar: userData.avatar
        })
        .eq("id", userId);
      
      if (error) {
        console.error("Error updating profile:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      return false;
    }
  },
  
  async uploadProfilePicture(userId: string, file: File): Promise<User | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        return null;
      }
      
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      if (!urlData.publicUrl) {
        console.error("Error getting public URL");
        return null;
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .update({ avatar: urlData.publicUrl })
        .eq("id", userId)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating profile:", error);
        return null;
      }
      
      return mapDbProfileToUser(data);
    } catch (error) {
      console.error("Error in uploadProfilePicture:", error);
      return null;
    }
  }
};
