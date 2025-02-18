import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import passport from 'passport'
import './config/oauth' // 初始化 OAuth 策略
import { prisma } from './config/db'
import authRouter from './routes/auth'
import userRouter from './routes/user'
import errorHandler from './middlewares/error'
import {authenticate} from './middlewares/auth'

const app = express()

// 中间件
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(passport.initialize())

// 路由
app.use('/auth', authRouter)
app.use('/users', authenticate, userRouter)

// 错误处理
app.use(errorHandler)

const PORT = process.env.PORT || 3000

prisma.$connect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}).catch(err => {
  console.error('Database connection failed:', err)
  process.exit(1)
})

export default app