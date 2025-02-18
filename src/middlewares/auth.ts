import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import createHttpError from 'http-errors'
import { prisma } from '../config/db'

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw createHttpError.Unauthorized('Invalid authorization header')
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) throw createHttpError.Unauthorized('User not found')
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}