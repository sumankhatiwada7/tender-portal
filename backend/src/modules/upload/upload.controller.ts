import type { apitype } from "../../core/types/apitype";
import { User } from "../user/user.model";

function getUploadedUrl(file: any): string {
  return String(file?.path || file?.secure_url || "").trim();
}

export async function uploadProfileImageHandler(req: any, res: any) {
  try {
    const file = req.file;
    if (!file) {
      const payload: apitype = { message: "No file uploaded", sucess: false };
      return res.status(400).json(payload);
    }

    const userId = req.user?.id;
    if (!userId) {
      const payload: apitype = { message: "Unauthorized", sucess: false };
      return res.status(401).json(payload);
    }

    const imageUrl = getUploadedUrl(file);
    if (!imageUrl) {
      const payload: apitype = { message: "Internal server error", sucess: false };
      return res.status(500).json(payload);
    }

    await User.findByIdAndUpdate(userId, { profileImage: imageUrl });

    return res.status(200).json({
      message: "Profile image uploaded successfully",
      sucess: true,
      url: imageUrl,
    });
  } catch (error) {
    console.error("Profile image upload failed", error);
    const payload: apitype = { message: "Internal server error", sucess: false };
    return res.status(500).json(payload);
  }
}
