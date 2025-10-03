import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: any;
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({ message: "No authorization header found" });
            return;
        }

        
        const token = authHeader;
            
            

        if (!token) {
            res.status(401).json({ message: "No token provided" });
            return;
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
            req.user = decoded;
            next();
        } catch (jwtError) {
            res.status(401).json({ 
                message: "Invalid or expired token",
                error: jwtError instanceof Error ? jwtError.message : 'Token verification failed'
            });
            return;
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ 
            message: "Authentication failed",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return;
    }
};