import mongoose from 'mongoose';
import { config } from 'dotenv';
config();

export const dbConnection = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    console.log(err);
    throw new Error('Error connecting to database');
  }
};

export const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    refreshToken: {
        type: String,
    },
});


// model to store image data
export const imageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});


export const User = mongoose.model('User', userSchema);
export const Image = mongoose.model('Image', imageSchema);



