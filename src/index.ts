import * as dotenv from 'dotenv';
dotenv.config();
import config from './config';
import app from './server';
import mongoose from 'mongoose';
import { dbConnection } from './dbconnection';

dbConnection();

mongoose.connection.once('open', () => {
  console.log('Connected to database');
  app.listen(config.port, () => {
    console.log(`Server is listening on port ${config.port}`);
  });
});
