const { initCloudinary } = require("../config/cloudinary");

function uploadImageBuffer({ buffer, folder }) {
  const cloudinary = initCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

async function uploadManyImageBuffers({ files, folder }) {
  const uploads = files.map((f) => uploadImageBuffer({ buffer: f.buffer, folder }));
  return Promise.all(uploads);
}

module.exports = { uploadImageBuffer, uploadManyImageBuffers };

