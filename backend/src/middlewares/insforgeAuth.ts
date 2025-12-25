import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// InsForge auth middleware - extracts user info from JWT token
export const insforgeAuthMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      // Decode JWT without verification (InsForge handles verification)
      const decoded = jwt.decode(token) as any;

      if (decoded && decoded.sub) {
        req.user = {
          userId: decoded.sub,
          email: decoded.email
        };
      }
    }

    next();
  } catch (error) {
    console.error('[Auth] Error parsing token:', error);
    next();
  }
};

// Middleware to require authentication
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }
  next();
};
