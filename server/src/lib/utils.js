import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  }); 

  res.cookie('jwt', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'strict', // csrf protection
    httpOnly: true, // this cookie cannot be accessed by client side javascript
    secure: process.env.NODE_ENV === 'production', // cookie will only be set in https and xss attacks will be prevented
  });

  return token;
}