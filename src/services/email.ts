import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
})

export const sendResetEmail = async (email: string, token: string) => {
  const resetLink = `http://yourapp.com/reset-password?token=${token}`

  await transporter.sendMail({
    from: '"Your App" <noreply@example.com>',
    to: email,
    subject: 'Password Reset Request',
    html: `
      <p>You requested a password reset. Click the link below to proceed:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `
  })
}

export const sendVerificationEmail = async (email: string, token: string) => {
    const verificationLink = `http://yourapp.com/verify-email?token=${token}`
  
    await transporter.sendMail({
      from: '"Your App" <noreply@example.com>',
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>This link will expire in 1 hour.</p>
      `
    })
  }