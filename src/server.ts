import express from 'express';
import router from './router';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { isAuth } from './modules/auth';
import {
  loginUserHandler,
  registerUserHandler,
} from './handlers/user';
import { credentials } from './modules/middleware';
import { logoutUserHandler } from './handlers/user';

export const allowedOrigins = [
  'https://www.yoursite.com',
  'http://127.0.0.1:5500',
  'http://localhost:3500',
  'http://localhost:3000',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};

const app = express();

app.use(credentials);

app.use(cors(corsOptions));

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  console.log('Hello from express');
  res.status(200);
  res.json({ message: 'Hello from express' });
});

app.use('/api', isAuth, router);

app.post('/register', registerUserHandler);
app.post('/login', loginUserHandler);
router.get('/logout', logoutUserHandler);

app.use((err, req, res, next) => {
  if (err.type === 'auth') {
    console.log(`Error: ${err.message}`);
    res.status(401);
    res.json({ message: `Error: ${err.message}` });
  } else {
    res.status(500);
    res.json({ message: `Server Error: ${err.message}` });
  }
});

export default app;
