import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
 
import errorHandler from './utils/errors/defaultError';
import router from './routes/index';

const app = express();
 
app.use(cookieParser());
app.use(express.json());
 
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(router);

app.use(errorHandler);

export default app;
 