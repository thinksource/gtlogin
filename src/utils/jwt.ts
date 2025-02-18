import jwt from 'jsonwebtoken'
import { JwtPayload } from '../types'

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '15m' })
}

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' })
}

export const verifyToken = (token: string, isRefresh = false): JwtPayload => {
  const secret = isRefresh ? process.env.JWT_REFRESH_SECRET! : process.env.JWT_SECRET!
  return jwt.verify(token, secret) as JwtPayload
}