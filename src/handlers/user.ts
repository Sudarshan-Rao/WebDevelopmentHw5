import { generateAccessToken, generateRefreshToken, hashPassword } from '../modules/auth';
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

    const user = new User({
      email,
      name,
      password: hashedPassword,
    });
    
    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200);
    res.json({ accessToken });

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
    if (!refreshToken) {
      console.log('No refresh token');
      res.status(400);
      res.json({ message: 'Refresh token is required' });
      return;
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET
    );

    const { id } = decoded as any;

    const user = 
      await
      User
        .findById(id)
        .exec();

    if (!user) {
      res.status(401);
      res.json({ message: 'Invalid refresh token' });
      return;
    }

    user.refreshToken = null;
    await user.save();

    res.clearCookie('refreshToken');
    res.status(200);
    res.json({ message: 'User logged out' });
  } catch (error) {
    error.type = 'auth';
    next(error);
  }
};
