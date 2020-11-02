import { verify } from 'jsonwebtoken'
const { ACCESS_TOKEN_SECRET_KEY } = process.env
const error = Error('Your not an Authorized Users, please SingIn first')
error.name = '401 Unauthorized'
error.status = 401
const authUser = (req, res, next) => {
  const authHeader = req.get('Authorization')
  // console.log('1st $authHeader', `${authHeader}`)
  if (authHeader) {
    authHeader.toString()
    // console.log('2nd typeof authHeader', typeof authHeader)
    const token = `${authHeader}`.split(' ')[1]
    console.log('3rd $token', token)
    if (!token || token === '') next(error)
    // console.log('4th (!req.userId || !req.role)', (!req.userId || !req.role))
    if (!req.userId || !req.role) {
      try {
        const decodedToken = verify(token, ACCESS_TOKEN_SECRET_KEY)
        // console.log(' $decodedToken: ', decodedToken)
        if (decodedToken) {
          req.userId = decodedToken.userId
          req.role = decodedToken.role
          req.username = decodedToken.username
        } else next(error)
      } catch (err) {
        next(err)
      }
    }
  } else next(error)
  next()
}

/**
 * @DESC Check Role Middleware
 */
const checkRole = roles => (req, res, next) =>
  !roles.includes(req.role)
    ? next(error)
    : next()

function getParams (query = '') {
  const params = { page: 1, limit: 25, order: 'DESC', sort: 'id', where: {} }
  if (query) {
    query = query.startsWith('?') ? query.substring(1) : query
    const temp = query.split('&')
    temp.forEach((param) => {
      const key = param.split('=')[0]
      const value = param.split('=')[1]
      if (key && value) {
        if (key === 'page' || key === 'limit') {
          params[key] = parseInt(value)
        } else if (key === 'order' || key === 'sort') {
          params[key] = value
        } else {
          params.where[key] = value
        }
      }
    })
    console.info('getParams(query)', params)
    return params
  } else {
    console.info('getParams(query)', params)
    return params
  }
}

function removeUserFields (object) {
  if (object.user == null) return object
  delete object.user.password
  delete object.user.userType
  delete object.user.isActivated
  delete object.user.isApproved
  delete object.user.activationKey
  delete object.user.deleted
  delete object.user.addressId
  delete object.user.createdAt
  delete object.user.updatedAt
  return object
}
export { authUser, checkRole, getParams, removeUserFields }
