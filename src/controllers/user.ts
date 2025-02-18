import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../config/db'
import createHttpError from 'http-errors'
import { sendVerificationEmail } from '../services/email'
import * as crypto from 'crypto';


export const getUserProfile = async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        isVerified: true,
        oauthProvider: true,
        createdAt: true
      }
    })
  
    res.json(user)
  }

// 获取当前用户资料
export const getCurrentUser = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      isVerified: true,
      oauthProvider: true,
      createdAt: true,
      updatedAt: true
    }
  })

  if (!user) {
    throw createHttpError.NotFound('User not found')
  }

  res.json(user)
}

// 更新用户密码
export const updateUserPassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body

  // 获取完整用户数据（包含密码）
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id }
  })

  if (!user) {
    throw createHttpError.NotFound('User not found')
  }

  // 本地账户密码验证
  if (user.password && !(await bcrypt.compare(oldPassword, user.password))) {
    throw createHttpError.Unauthorized('Invalid password')
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: { id: req.user!.id },
    data: { password: hashedPassword }
  })

  res.json({ message: 'Password updated successfully' })
}

// 更新用户邮箱
export const updateUserEmail = async (req: Request, res: Response) => {
  const { newEmail, password } = req.body

  const user = await prisma.user.findUnique({
    where: { id: req.user!.id }
  })

  if (!user) {
    throw createHttpError.NotFound('User not found')
  }

  // 验证当前密码
  if (user.password && !(await bcrypt.compare(password, user.password))) {
    throw createHttpError.Unauthorized('Invalid password')
  }

  // 检查邮箱是否已被使用
  const existingUser = await prisma.user.findUnique({
    where: { email: newEmail }
  })

  if (existingUser) {
    throw createHttpError.Conflict('Email already in use')
  }

  // 生成验证令牌
  const verificationToken = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 3600000) // 1小时后过期

  // 事务处理：更新邮箱并创建验证记录
  await prisma.$transaction([
    prisma.user.update({
      where: { id: req.user!.id },
      data: {
        email: newEmail,
        isVerified: false
      }
    }),
    prisma.resetToken.create({
      data: {
        token: verificationToken,
        expiresAt,
        userId: req.user!.id
      }
    })
  ])

  // 发送验证邮件
  await sendVerificationEmail(newEmail, verificationToken)

  res.json({ 
    message: 'Email updated. Please verify your new email address',
    newEmail
  })
}

// 删除用户账户
export const deleteUserAccount = async (req: Request, res: Response) => {
  await prisma.$transaction([
    // 删除关联的验证令牌
    prisma.resetToken.deleteMany({
      where: { userId: req.user!.id }
    }),
    // 删除用户主体
    prisma.user.delete({
      where: { id: req.user!.id }
    })
  ])

  res.status(204).send()
}

// 验证邮箱地址
export const verifyUserEmail = async (req: Request, res: Response) => {
  const { token } = req.body

  const verificationRecord = await prisma.resetToken.findFirst({
    where: {
      token,
      expiresAt: { gt: new Date() },
      user: { id: req.user!.id }
    }
  })

  if (!verificationRecord) {
    throw createHttpError.BadRequest('Invalid or expired token')
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: req.user!.id },
      data: { isVerified: true }
    }),
    prisma.resetToken.deleteMany({
      where: { userId: req.user!.id }
    })
  ])

  res.json({ message: 'Email verified successfully' })
}