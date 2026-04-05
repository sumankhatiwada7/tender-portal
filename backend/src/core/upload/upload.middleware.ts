import multer from "multer";
import path from "path";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import type { Request } from "express";
import { cloudinary, configureCloudinaryIfNeeded, isCloudinaryConfigured } from "./cloudinary";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const profileFormats = new Set(["jpg", "jpeg", "png", "webp"]);
const verificationFormats = new Set(["jpg", "jpeg", "png", "pdf", "doc", "docx"]);
const documentFormats = new Set(["pdf", "doc", "docx"]);

function getExtension(fileName: string): string {
  return path.extname(fileName || "").replace(".", "").toLowerCase();
}

function invalidFormatError() {
  const err = new Error("Invalid file format");
  (err as any).statusCode = 400;
  return err;
}

function buildStorage(
  folder: string,
  acceptedFormats: Set<string>,
  resourceTypeResolver: (ext: string) => "image" | "raw"
) {
  return new CloudinaryStorage({
    cloudinary,
    params: (_req: Request, file: Express.Multer.File) => {
      configureCloudinaryIfNeeded();

      if (!isCloudinaryConfigured()) {
        throw new Error("Cloudinary credentials are not configured");
      }

      const ext = getExtension(file.originalname);
      if (!acceptedFormats.has(ext)) {
        throw invalidFormatError();
      }

      return {
        folder,
        resource_type: resourceTypeResolver(ext),
        transformation: folder.endsWith("profiles")
          ? [{ width: 400, height: 400, crop: "fill" }]
          : undefined,
      } as any;
    },
  });
}

const profileStorage = buildStorage(
  "tender-system/profiles",
  profileFormats,
  () => "image"
);

const verificationStorage = buildStorage(
  "tender-system/verification",
  verificationFormats,
  (ext) => (profileFormats.has(ext) ? "image" : "raw")
);

const documentStorage = buildStorage(
  "tender-system/documents",
  documentFormats,
  () => "raw"
);

function fileFilter(allowedFormats: Set<string>) {
  return (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = getExtension(file.originalname);
    if (!allowedFormats.has(ext)) {
      return cb(invalidFormatError());
    }

    cb(null, true);
  };
}

export const uploadProfileImage = multer({
  storage: profileStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter(profileFormats),
});

export const uploadVerification = multer({
  storage: verificationStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter(verificationFormats),
});

export const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter(documentFormats),
});

export function handleUploadError(error: any, res: any) {
  if (!error) {
    return false;
  }

  if (error.message === "Invalid file format") {
    return res.status(400).json({ message: "Invalid file format", sucess: false });
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File size exceeds 10MB", sucess: false });
  }

  if (error.message === "Cloudinary credentials are not configured") {
    return res.status(500).json({ message: "Internal server error", sucess: false });
  }

  return res.status(500).json({ message: "Internal server error", sucess: false });
}
