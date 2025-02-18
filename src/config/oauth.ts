import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { prisma } from './db'
import { generateAccessToken } from '../utils/jwt'

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: '/auth/google/callback',
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0].value
    if (!email) return done(new Error('No email found'), false)

    let user = await prisma.user.findFirst({
      where: { OR: [{ oauthId: profile.id }, { email }] }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          oauthId: profile.id,
          oauthProvider: 'google',
          isVerified: true
        }
      })
    }

    done(null, user)
  } catch (err) {
    done(err)
  }
}))

// 序列化用户
passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id: string, done) => {
  const user = await prisma.user.findUnique({ where: { id } })
  done(null, user)
})