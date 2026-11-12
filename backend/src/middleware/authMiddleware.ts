import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  userId?: string;
}

interface JwtPayload {
  userId: string;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'securax_jwt_secret_dev_key';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      res.status(401).json({ success: false, message: 'User account not found or has been removed.' });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error: any) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
};
