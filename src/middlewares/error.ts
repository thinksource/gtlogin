import { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import createHttpError from 'http-errors'
import { Prisma } from '@prisma/client'

const errorHandler: ErrorRequestHandler =  (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
)  => {
  // 处理已知错误类型
  if (createHttpError.isHttpError(err)) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.name
      }
    })
  }

  // 处理 Prisma 错误
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    res.status(400).json({
      error: {
        message: 'Database operation failed',
        code: err.code
      }
    })
  }

  // 处理 JWT 错误
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      }
    })
  }

  // 未知错误处理
  console.error(err)
  res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  })
}

export default errorHandler