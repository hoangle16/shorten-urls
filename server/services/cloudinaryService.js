const cloudinary = require("../config/cloudinary");

const uploadImage = async (fileBuffer, fileType) => {
  const fileStr = fileBuffer.toString("base64");

  const uploadResponse = await cloudinary.uploader.upload(
    `data:${fileType};base64,${fileStr}`,
    {
      folder: "avatars",
      transformation: [
        { width: 500, height: 500, crop: "fill" },
        { quality: "auto" },
      ],
    }
  );

  return uploadResponse;
};

const deleteImage = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadImage, deleteImage };
