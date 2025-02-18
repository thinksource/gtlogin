import { Router } from 'express'
import { getUserProfile, updateUserPassword } from '../controllers/user'
import { authenticate } from '../middlewares/auth'

const router = Router()

// 需要认证的路由
router.use(authenticate)

router.get('/me', getUserProfile)
router.patch('/password', updateUserPassword)

export default router