import { Router } from 'express'
import {
  register,
  login,
  requestPasswordReset,
  handleOAuthCallback,
  refreshToken
} from '../controllers/auth'
import passport from 'passport'

const router = Router()

// 本地认证
router.post('/register', register)
router.post('/login', login)
router.post('/request-reset', (req, res, next) => {
  requestPasswordReset(req, res, next).catch(next)})

// OAuth 路由
router.get('/google', passport.authenticate('google'))
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  handleOAuthCallback
)

// Token 刷新
router.post('/refresh', refreshToken)

export default router