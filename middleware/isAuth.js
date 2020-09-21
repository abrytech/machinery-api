import { verify } from 'jsonwebtoken'
const { ACCESS_TOKEN_SECRET_KEY } = process.env
export default (req, res, next) =>{
  const authHeader = req.get('Authorization')
  if (!authHeader) {
    req.isAuth = false
    return next()
  }
  const token = authHeader.split(' ')[1]
  if (!token || token === '') {
    req.isAuth = false
    return next()
  }
  let decodedToken
  if(!req.userId && !req.isAuth){
    try {
      decodedToken = verify(token, ACCESS_TOKEN_SECRET_KEY)
      req.userId = decodedToken.userId
      req.userType = decodedToken.userType
      if (decodedToken) {
        req.isAuth = true
        return next()
      } else req.isAuth = false
    } catch (err) {
      req.isAuth = false
      return next()
    }
  }
  next()
}
