import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
} from '../modules/auth';
import { validatePassword } from '../modules/auth';
import { User } from '../dbconnection';
import jwt from 'jsonwebtoken';

export const registerUserHandler = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      res.status(400);
      res.json({ message: 'Email, name and password are required' });
      return;
    }

    const duplicateUser = await User.findOne({ email }).exec();
    if (duplicateUser) {
      res.status(400);
      res.json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      email,
      name,
      password: hashedPassword,
    });

    console.log(user);

    res.status(201).json({ success: `New user ${name} created!` });

    // const accessToken = await generateAccessToken(user);
    // const refreshToken = await generateRefreshToken(user);

    // user.refreshToken = refreshToken;
    // await user.save();

    // res.cookie('refreshToken', refreshToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'none',
    //   domain: 'localhost',
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    // res.status(200);
    // res.json({ accessToken });
  } catch (error) {
    error.type = 'auth';
    next(error);
  }
};

export const loginUserHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      res.json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      res.status(401);
      res.json({ message: 'Invalid email' });
    }

    const isValidPassword = await validatePassword(
      password,
      user.password
    );
    if (!isValidPassword) {
      res.status(401);
      res.json({ message: 'Invalid password' });
    }

    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200);
    res.json({ accessToken });
  } catch (error) {
    error.type = 'auth';
    next(error);
  }
};

//route to logout user
export const logoutUserHandler = async (req, res, next) => {
  //delete refresh token from database
  try {
    // get cookie from request
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.sendStatus(204);

    const user = await User.findOne({
      refreshToken,
    }).exec();

    if (!user) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
      return res.sendStatus(204);
    }

    user.refreshToken = null;
    await user.save();

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.sendStatus(204);
  } catch (error) {
    error.type = 'auth';
    next(error);
  }
};
