import express from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { uploadProfileImage, handleUploadError } from "../../core/upload/upload.middleware";
import { uploadProfileImageHandler } from "./upload.controller";

const router = express.Router();

router.post(
  "/profile-image",
  authMiddleware,
  (req, res, next) => {
    uploadProfileImage.single("image")(req, res, (error) => {
      if (error) {
        return handleUploadError(error, res);
      }

      next();
    });
  },
  uploadProfileImageHandler
);

export default router;
