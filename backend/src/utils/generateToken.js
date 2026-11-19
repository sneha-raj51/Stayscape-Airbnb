const jwt = require('jsonwebtoken');

/**
 * Generate JWT and set it in an HTTP-only secure cookie
 * @param {Object} res - Express response object
 * @param {string|mongoose.Types.ObjectId} userId - User ID
 * @returns {string} - Generated JWT token
 */
const generateToken = (res, userId) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_development';
  const expiresIn = process.env.JWT_EXPIRE || '7d';

  const token = jwt.sign({ id: userId }, secret, {
    expiresIn
  });

  // Calculate cookie maxAge in ms (default to 7 days)
  let maxAge = 7 * 24 * 60 * 60 * 1000;
  if (expiresIn.endsWith('d')) {
    maxAge = parseInt(expiresIn, 10) * 24 * 60 * 60 * 1000;
  } else if (expiresIn.endsWith('h')) {
    maxAge = parseInt(expiresIn, 10) * 60 * 60 * 1000;
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge
  };

  res.cookie('token', token, cookieOptions);

  return token;
};

module.exports = generateToken;
