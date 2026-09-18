const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UPLOAD_FOLDER = "shayam_mate/documents";

// Uploaded as type "authenticated" — never publicly reachable by the
// returned URL alone. Sensitive doc_types (PAN, Aadhaar, incorporation
// certs) pass through here, so nothing is servable without a fresh signature.
const uploadBuffer = (buffer, mimetype) => {
  const dataUri = `data:${mimetype};base64,${buffer.toString("base64")}`;

  return cloudinary.uploader.upload(dataUri, {
    folder: UPLOAD_FOLDER,
    resource_type: "auto",
    type: "authenticated",
  });
};

// Mints a short-lived signed URL for an already-uploaded asset. Call this
// fresh on every authorized view/download request — never cache or reuse.
const getSignedUrl = (publicId, resourceType, format) => {
  return cloudinary.utils.private_download_url(publicId, format, {
    resource_type: resourceType,
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + 5 * 60, // 5 minutes
  });
};

const deleteAsset = (publicId, resourceType) =>
  cloudinary.uploader.destroy(publicId, { resource_type: resourceType, type: "authenticated" });

module.exports = { cloudinary, uploadBuffer, getSignedUrl, deleteAsset };
