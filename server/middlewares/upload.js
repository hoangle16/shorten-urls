const multer = require("multer");
const { CustomError } = require("../helpers/utils");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new CustomError("Not an image file!", 400));
    }
  },
});

module.exports = upload;