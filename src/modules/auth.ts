import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../dbconnection';

export const validatePassword = async (
  password: string,
  hash: string
) => {
  return await bcrypt.compare(password, hash);
};

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const generateAccessToken = async (user: any) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: '1d',
    }
  );
};

export const generateRefreshToken = async (user: any) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    {
      expiresIn: '7d',
    }
  );
};

export const refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      res.status(400);
      res.json({ message: 'Refresh token is required' });
      return
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET
    );

    const { id } = decoded as any;

    const user = await User.findById(id);

    if (!user) {
      res.status(401);
      res.json({ message: 'Invalid refresh token' });
        return
    }

    const accessToken = await generateAccessToken(user);

    res.status(200);
    res.json({ accessToken });
  } catch (error) {
    error.type = 'auth';
    next(error);
  }
};

export const isAuth = (req: any, res: any, next: any) => {
  const authorization = req.headers.authorization;
  console.log(authorization);
  if (!authorization) {
    res.status(401);
    res.json({ message: 'No Token' });
    return
  }

  const token = authorization.slice(7, authorization.length); // Bearer XXXXXX

  try {
    const decoded = jwt.verify(
      token,
        process.env.JWT_ACCESS_TOKEN_SECRET || 'somethingsecret'
    );
    console.log('decoded user', decoded);

    req.user = decoded;
    next();
  } catch (error) {
    error.type = 'auth';
    next(error);
  }
};
