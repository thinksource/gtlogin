export interface JwtPayload {
    userId: string;
    iat?: number;    // issued at (自动添加)
    exp?: number;    // expiration time (自动添加)
  }
  
  // 扩展 Express 的 Request 类型
  declare global {
    namespace Express {
      interface User {
        id: string;
        email: string;
        isVerified: boolean;
      }
  
      interface Request {
        user?: User;
      }
    }
  }