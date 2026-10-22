import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email?: string;
    phone?: string;
    role: 'CUSTOMER' | 'MANAGER' | 'ADMIN';
  };
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, config.SESSION_SECRET) as {
      id: number;
      email?: string;
      phone?: string;
      role: 'CUSTOMER' | 'MANAGER' | 'ADMIN';
    };

    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

export const requireRole = (allowedRoles: ('CUSTOMER' | 'MANAGER' | 'ADMIN')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};

export const requireManagerRole = requireRole(['MANAGER', 'ADMIN']);
export const requireAdminRole = requireRole(['ADMIN']);
