import multer from "multer";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    const error = new Error(
      "Only JPEG, PNG, WEBP and GIF images are allowed."
    );

    error.statusCode = 400;

    return callback(error);
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

export const uploadSingleImage = upload.single("image");

export const uploadMultipleImages = upload.array("images", 5);

export default upload;