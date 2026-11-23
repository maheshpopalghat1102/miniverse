
import api from "./api";

function createImageFormData(file, fieldName = "image") {
  if (!(file instanceof File)) {
    throw new TypeError("Please select a valid file.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error("Image must be smaller than 5 MB.");
  }

  const formData = new FormData();
  formData.append(fieldName, file);

  return formData;
}

async function uploadImage(file, type) {
    createImageFormData(file);
    const signatureResponse = await api.post("/uploads/signature", { type });
    const upload = signatureResponse.upload;
    if (!upload?.cloudName || !upload.apiKey || !upload.signature) {
      throw new Error("The upload service returned incomplete credentials.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", upload.apiKey);
    formData.append("timestamp", String(upload.timestamp));
    formData.append("signature", upload.signature);
    formData.append("folder", upload.folder);
    formData.append("public_id", upload.publicId);
    formData.append("transformation", upload.transformation);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(upload.cloudName)}/image/upload`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error?.message || "Image upload failed.");
    return result;
}

const uploadService = {
  upload(file, type) {
    return uploadImage(file, type);
  },

  uploadAvatar(file) {
    return uploadImage(file, "avatar");
  },

  uploadCoverImage(file) {
    return uploadImage(file, "cover");
  },

  uploadGameImage(file) {
    return uploadImage(file, "game");
  },

  uploadChatImage(file) {
    return uploadImage(file, "picture");
  },

  deleteImage(publicId) {
    return api.delete("/uploads", {
      body: { publicId },
    });
  },
};

export default uploadService;
