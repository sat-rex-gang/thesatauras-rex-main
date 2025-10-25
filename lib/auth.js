import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

async function hashPassword(password) {
  return await bcrypt.hash(password, 12)
}

async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword)
}

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken
}
