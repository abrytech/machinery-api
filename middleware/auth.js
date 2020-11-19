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
    // console.log('3rd $token', token)
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

// const roles_table = [{ id: 1, role: 'Admin' }, { id: 1, role: 'User' }]
// const resources_table = [{ id: 1, resource: 'users' }, { id: 2, resource: 'addresses' }, { id: 2, resource: 'machines' }, { id: 3, resource: 'machineries' }, { id: 4, resource: 'jobs' }, { id: 5, resource: 'requests' }]
const permissionTable = [
  { id: 1, role: 'Admin', resource: '/users', permissions: { create: true, read: true, write: true, delete: true } },
  { id: 2, role: 'Admin', resource: '/addresses', permissions: { create: true, read: true, write: true, delete: true } },
  { id: 3, role: 'Admin', resource: '/machines', permissions: { create: true, read: true, write: true, delete: true } },
  { id: 4, role: 'Admin', resource: '/machineries', permissions: { create: true, read: true, write: true, delete: true } },
  { id: 5, role: 'Admin', resource: '/jobs', permissions: { create: true, read: true, write: true, delete: true } },
  { id: 6, role: 'Admin', resource: '/requests', permissions: { create: true, read: true, write: true, delete: true } },
  { id: 7, role: 'User', resource: '/requests', permissions: { create: true, read: true, write: true, delete: true } },
  { id: 8, role: 'User', resource: '/users', permissions: { create: true, read: true, write: true, delete: true } },
  { id: 9, role: 'User', resource: '/jobs', permissions: { create: true, read: true, write: true, delete: true } },
  { id: 10, role: 'User', resource: '/machineries', permissions: { create: true, read: true, write: true, delete: true } }
]

const checkRole = (req, res, next) => {
  if (req.userId) {
    const perms = permissionTable.filter(perm => {
      return perm.resource === req.path && perm.role === req.role
    })
    var allow = false
    // you can do this mapping of methods to permissions before the db call and just get the specific permission you want.
    for (const perm in perms) {
      console.log('perm.resource === req.path && perm.role === req.role ::>', `${perm.resource} === ${req.path} && ${perm.role} === ${req.role}`)
      console.log("req.method === 'GET' && perm.permissions.read", ` ${req.method === 'GET'} && ${perm.permissions.read}`)
      if (req.method === 'POST' && perm.permissions.create) allow = true
      else if (req.method === 'GET' && perm.permissions.read) allow = true
      else if (req.method === 'PUT' && perm.permissions.write) allow = true
      else if (req.method === 'DELETE' && perm.permissions.delete) allow = true
    }
    if (allow) next()
    else res.status(403).send({ error: { name: 'Access denied', message: 'You dont have this level of access ', stack: '' } })
  } else res.status(400).send({ error: { name: 'Bad Request', message: 'This User does\'t exist', stack: '' } })
}
/**
 * @DESC Check Role Middleware
 */
// const checkRole = roles => (req, res, next) =>
//   !roles.includes(req.role)
//     ? next(error)
//     : next()

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

function removeFields (object) {
  console.log('(typeof object).toString() === \'array\'', (typeof object).toString() === 'array')
  if ((typeof object).toString() === 'array') {
    object.map(obj => {
      console.log('(typeof obj.user).toString() === \'object\'', (typeof obj.user).toString() === 'object')
      if ((typeof obj.user).toString() === 'object') {
        delete object.user.password
        delete object.user.userType
        delete object.isActivated
        delete object.user.isApproved
        delete object.user.activationKey
        delete object.user.deleted
        delete object.user.addressId
        delete object.user.pictureId
        return object
      } else {
        delete object.password
        delete object.userType
        delete object.isActivated
        delete object.isApproved
        delete object.activationKey
        delete object.deleted
        delete object.pictureId
        delete object.addressId
        delete object.machineId
        delete object.userId
        return object
      }
    })
  }
  console.log('object.id == null', object.id == null)
  if (object.id == null) return object
  console.log('(typeof object.user).toString() === \'object\'', (typeof object.user).toString() === 'object')
  if ((typeof object.user).toString() === 'object') {
    delete object.user.password
    delete object.user.userType
    delete object.isActivated
    delete object.user.isApproved
    delete object.user.activationKey
    delete object.user.deleted
    delete object.user.addressId
    delete object.user.pictureId
    return object
  } else {
    delete object.password
    delete object.userType
    delete object.isActivated
    delete object.isApproved
    delete object.activationKey
    delete object.deleted
    delete object.addressId
    delete object.pictureId
    delete object.machineId
    delete object.userId
    // delete object.createdAt
    // delete object.updatedAt
    return object
  }
}
export { authUser, checkRole, getParams, removeFields }
