import api from "./axios";

export function uploadProfileImage(formData: FormData) {
  return api.post("/upload/profile-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
