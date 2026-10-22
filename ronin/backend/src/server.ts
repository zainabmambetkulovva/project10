import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { i18n } from './config/i18n';
import routes from './routes';

const app = express();
const PORT = config.port;

// Security middleware
app.use(helmet());
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.sessionSecret));

// Logging
if (config.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

// i18n
app.use(i18n.handle);

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ronin-backend',
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ERROR]', err.message, err.stack);

  if (err.message === 'Unauthorized') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (err.message === 'Forbidden') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'production' ? 'Something went wrong' : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`✅ RONIN Backend server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
  console.log(`🛡️ Environment: ${config.nodeEnv}`);
});

export default app;
