import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import customizableProductsRoutes from './routes/customizableProducts.routes';
import cloudinaryRoutes from './routes/cloudinary.routes';
import canvasResourcesRoutes from './routes/canvasResources.routes';

const app = express();

// Simple CORS - allow frontend origins
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/api/customizable-products', customizableProductsRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/canvas-resources', canvasResourcesRoutes);

app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`✅ Auth server running on http://localhost:${port}`);
  console.log(`📝 Allowed origins: ${allowedOrigins.join(', ')}`);
}).on('error', (error: any) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
