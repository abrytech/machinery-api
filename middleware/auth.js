import { verify } from 'jsonwebtoken'
const { ACCESS_TOKEN_SECRET_KEY } = process.env
const error = Error('Your not an Authorized Users, please SingIn first')
error.name = '401 Unauthorized'
error.status = 401
const authUser = (req, res, next) => {
  const authHeader = req.get('Authorization')
  if (!authHeader) next(error)
  const token = authHeader.split(' ')[1]
  if (!token || token === '') next(error)
  if (!req.userId || !req.role) {
    try {
      const decodedToken = verify(token, ACCESS_TOKEN_SECRET_KEY)
      if (decodedToken) {
        req.userId = decodedToken.userId
        req.role = decodedToken.role
      } else next(error)
    } catch (err) {
      next(err)
    }
  }
  next()
}

/**
 * @DESC Check Role Middleware
 */
const checkRole = roles => (req, res, next) =>
  !roles.includes(req.role)
    ? next(error)
    : next()

export default { authUser, checkRole }
