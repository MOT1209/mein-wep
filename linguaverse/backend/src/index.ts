import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { prisma } from './config/database';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { AppError } from './utils/errors';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((_req, _res, next) => {
  next(new AppError('Route not found', 404));
});

// Error handler
app.use(errorHandler);

// Start server
async function main() {
  // Test database connection
  await prisma.$connect();
  console.log('✅ Database connected');

  app.listen(env.PORT, () => {
    console.log(`🚀 LinguaVerse API running on http://localhost:${env.PORT}`);
    console.log(`📚 Environment: ${env.NODE_ENV}`);
  });
}

main().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

export default app;
