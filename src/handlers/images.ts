import { Image } from '../dbconnection';
import multer from 'multer';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
  region: process.env.AWS_REGION,
});

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
}).single('image');

export const uploadImageHandler = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      console.log(err);
      res.status(400);
      res.json({ message: 'Invalid file type' });
      return;
    }
    try {
      const { originalname, buffer } = req.file;
      const { id } = req.user;
      const key = `${id}/${uuidv4()}-${originalname}`;
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ACL: 'public-read-write',
        ContentType: 'image/jpeg',
      };
      const result = await s3
        .upload(params, (err, data) => {
          if (err) {
            console.log(err);
            res.status(400);
            res.json({ message: 'Error uploading file' });
            return;
          }
          //   console.log(data);
        })
        .promise();

      const image = new Image({
        name: key,
        location: result.Location,
        user: id,
      });
      image.save((err, data) => {
        if (err) {
          console.log(err);
          res.status(400);
          res.json({ message: 'Error saving file' });
          return;
        }
      });
      res.status(200);
      res.json({ message: 'Image uploaded successfully', image });
    } catch (err) {
      next(err);
    }
  });
};

export const getImagesHandler = async (req, res, next) => {
  try {
    const images = await Image.find({ user: req.user.id });
    res.status(200);
    res.json({ images });
  } catch (err) {
    next(err);
  }
};
