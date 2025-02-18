import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { prisma } from '../config/db'
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt'
import { sendResetEmail } from '../services/email'
import createHttpError from 'http-errors'
export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) throw createHttpError.Conflict('Email already exists')

  const hashedPassword = await bcrypt.hash(password, 12)
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "USER"
    }
  })

  res.status(201).json({ 
    id: user.id,
    email: user.email
  })
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password) {
    throw createHttpError.Unauthorized('Invalid credentials')
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) throw createHttpError.Unauthorized('Invalid credentials')

  const accessToken = generateAccessToken(user.id)
  const refreshToken = generateRefreshToken(user.id)

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken }
  })

  res.json({ accessToken, refreshToken })
}

export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  const { email } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.json({ message: 'If email exists, reset link sent' })

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 3600000) // 1小时过期

  await prisma.resetToken.create({
    data: {
      token,
      expiresAt,
      userId: user.id
    }
  })

  await sendResetEmail(user.email, token)
  res.json({ message: 'Password reset email sent' })
}

// OAuth 回调处理
export const handleOAuthCallback = (req: Request, res: Response) => {
  if (!req.user) {
    throw createHttpError.Unauthorized('User not authenticated')
  }
  const accessToken = generateAccessToken(req.user.id)
  res.redirect(`/oauth-callback?token=${accessToken}`)
}

// Token 刷新
export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body
  if (!refreshToken) throw createHttpError.BadRequest('Missing refresh token')

  const decoded = verifyToken(refreshToken, true)
  
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId, refreshToken }
  })

  if (!user) throw createHttpError.Unauthorized('Invalid refresh token')
  
  const newAccessToken = generateAccessToken(user.id)
  res.json({ accessToken: newAccessToken })
}