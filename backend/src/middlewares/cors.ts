import cors from 'cors';
import config from '../config';

// CORS middleware configuration
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests without origin (mobile apps, Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (config.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow Vercel deployments
    if (origin.includes('vercel.app') || origin.includes('accounting-app')) {
      return callback(null, true);
    }
    
    // In development, allow all origins
    if (config.nodeEnv === 'development') {
      return callback(null, true);
    }
    
    // In production, also allow for now (can be restricted later)
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition']
});
