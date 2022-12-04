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

export const generateAccessToken = (user: any) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: '1d',
    }
  );
};

export const generateRefreshToken = (user: any) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
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
      res.status(401);
      res.json({ message: 'Refresh token is required' });
      return;
    }

    const user = await User.findOne({ refreshToken }).exec();
    console.log(user);
    if (!user) return res.sendStatus(403);

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || user.email !== decoded.email) {
          res.status(403);
          res.json({ message: 'Invalid refresh token' });
          return;
        }

        console.log(
          `Refresh token verified for user ${user.email} ${user}`
        );

        const accessToken = generateAccessToken(user);
        console.log(`Access token after refresh: ${accessToken}`);
        res.status(200).json({ accessToken });
      }
    );
  } catch (error) {
    error.type = 'auth';
    next(error);
  }
};

export const isAuth = (req: any, res: any, next: any) => {
  const authorization = req.headers.authorization;
  // console.log(authorization);
  if (!authorization) {
    res.status(401);
    res.json({ message: 'No Token' });
    return;
  }

  const token = authorization.slice(7, authorization.length); // Bearer XXXXXX

  console.log(`isAuthToken: ${token}`);
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET || 'somethingsecret'
    );
    // console.log('decoded user', decoded);

    req.user = decoded;
    next();
  } catch (error) {
    error.type = 'auth';
    next(error);
  }
};
