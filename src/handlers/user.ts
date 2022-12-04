import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
} from '../modules/auth';
import { validatePassword } from '../modules/auth';
import { User } from '../dbconnection';

export const registerUserHandler = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      res.status(400);
      res.json({ message: 'Email, name and password are required' });
      return;
    }

    const emailLowerCase = email.toLowerCase();

    const duplicateUser = await User.findOne({
      email: emailLowerCase,
    }).exec();
    if (duplicateUser) {
      res.status(400);
      res.json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      email: emailLowerCase,
      name,
      password: hashedPassword,
    });

    // console.log(user);

    res.status(201).json({ success: `New user ${name} created!` });
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
      return;
    }

    const emailLowerCase = email.toLowerCase();

    const user = await User.findOne({ email: emailLowerCase }).exec();

    if (!user) {
      res.status(401);
      res.json({ message: 'Invalid email' });
      return;
    }

    const isValidPassword = await validatePassword(
      password,
      user.password
    );
    if (!isValidPassword) {
      res.status(401);
      res.json({ message: 'Invalid password' });
      return;
    }

    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    user.refreshToken = refreshToken;
    const result = await user.save();

    console.log(result);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, //process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ accessToken });
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
    // console.log(req);
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.sendStatus(204);

    const user = await User.findOne({
      refreshToken,
    }).exec();

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true, //process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    error.type = 'auth';
    next(error);
  }
};
