import { verify } from 'jsonwebtoken'
import { User } from '../sequelize/models'
const { ACCESS_TOKEN_SECRET_KEY } = process.env
const error = Error('Your not an authorized user, please singIn first')
error.name = '401 Unauthorized'
error.status = 401

const authUser = async (req, res, next) => {
  const authHeader = req.get('Authorization')
  if (authHeader) {
    console.log(`::::::::::::::::::<<<<<<<<<<<<<<< typeof (authHeader): ${typeof (authHeader)} >>>>>>>>>>>:::::::::::::::::`)
    console.log(`::::::::::::::::::<<<<<<<<<<<<<<< authHeader: ${authHeader} >>>>>>>>>>>:::::::::::::::::`)
    // console.log('2nd typeof authHeader', typeof authHeader)
    const token = `${authHeader}`.split(' ')[1]
    // console.log('3rd $token', token)
    if (!token || token === '') next(error)
    console.log('{!req.userId} || {!req.role} || {!req.username}', `${req.userId} || ${req.role} || ${req.username}`)
    if (!req.userId || !req.role || !req.username) {
      verify(token, ACCESS_TOKEN_SECRET_KEY, async (err, decoded) => {
        if (err) {
          error.message = err.message
          error.name = err.name
          next(error)
        } else {
          const where = { id: decoded.userId, isApproved: true, isActivated: true, spam: false, deleted: false, role: decoded.role, username: decoded.username }
          const isUser = await User.findOne({ where }).catch((err) => {
            error.message = err.message
            error.stack = err.stack
            next(error)
          })
          if (isUser) {
            req.userId = isUser.id
            req.role = isUser.role
            req.username = isUser.username
            next()
          } else {
            error.message = 'Invalid token,  Please signin again your access token may be expired'
            next(error)
          }
        }
      })
    } else {
      // const where = { id: req.userId, isApproved: true, isActivated: true, spam: false, deleted: false, role: req.role, username: req.username }
      // const isUser = await User.findOne({ where }).catch((err) => {
      //   error.message = err.message
      //   error.stack = err.stack
      //   next(error)
      // })
      // if (isUser) next()
      // else {
      //   error.message = 'Invalid token,  Please signin again your access token may be expired'
      //   next(error)
      // }
      next()
    }
  } else next(error)
}

// const roles_table = [{ id: 1, role: 'Admin' }, { id: 1, role: 'User' }]
// const resources_table = [{ id: 1, resource: 'users' }, { id: 2, resource: 'addresses' }, { id: 2, resource: 'machines' }, { id: 3, resource: 'machineries' }, { id: 4, resource: 'jobs' }, { id: 5, resource: 'requests' }]
// const permissionTable = [
//   { id: 1, role: 'Admin', resource: '/users', permissions: { create: true, read: true, write: true, delete: true } },
//   { id: 2, role: 'Admin', resource: '/addresses', permissions: { create: true, read: true, write: true, delete: true } },
//   { id: 3, role: 'Admin', resource: '/machines', permissions: { create: true, read: true, write: true, delete: true } },
//   { id: 4, role: 'Admin', resource: '/machineries', permissions: { create: true, read: true, write: true, delete: true } },
//   { id: 5, role: 'Admin', resource: '/jobs', permissions: { create: true, read: true, write: true, delete: true } },
//   { id: 6, role: 'Admin', resource: '/requests', permissions: { create: true, read: true, write: true, delete: true } },
//   { id: 7, role: 'User', resource: '/requests', permissions: { create: true, read: true, write: true, delete: true } },
//   { id: 8, role: 'User', resource: '/users', permissions: { create: true, read: true, write: true, delete: true } },
//   { id: 9, role: 'User', resource: '/jobs', permissions: { create: true, read: true, write: true, delete: true } },
//   { id: 10, role: 'User', resource: '/machineries', permissions: { create: true, read: true, write: true, delete: true } }
// ]

// const checkRole = (req, res, next) => {
//   if (req.userId) {
//     const perms = permissionTable.filter(perm => {
//       return perm.resource === req.path && perm.role === req.role
//     })
//     var allow = false
//     // you can do this mapping of methods to permissions before the db call and just get the specific permission you want.
//     for (const perm in perms) {
//       console.log('perm.resource === req.path && perm.role === req.role ::>', `${perm.resource} === ${req.path} && ${perm.role} === ${req.role}`)
//       console.log("req.method === 'GET' && perm.permissions.read", ` ${req.method === 'GET'} && ${perm.permissions.read}`)
//       if (req.method === 'POST' && perm.permissions.create) allow = true
//       else if (req.method === 'GET' && perm.permissions.read) allow = true
//       else if (req.method === 'PUT' && perm.permissions.write) allow = true
//       else if (req.method === 'DELETE' && perm.permissions.delete) allow = true
//     }
//     if (allow) next()
//     else res.status(403).send({ error: { name: 'Access denied', message: 'You dont have this level of access ', stack: '' } })
//   } else res.status(400).send({ error: { name: 'Bad Request', message: 'This User does\'t exist', stack: '' } })
// }
/**
 * @DESC Check Role Middleware
 */
// const checkRole = roles => (req, res, next) =>
//   !roles.includes(req.role)
//     ? next(error)
//     : next()

const getParams = (req, res, next) => {
  const params = { page: 1, limit: 25, order: 'DESC', sort: 'id', where: {} }
  let query = req.params.query
  try {
    const isQueryValid = (new RegExp('[?]{1}[a-zA-Z0-9%&=@.]+[a-zA-Z0-9]{1,}|[a-zA-Z0-9%&=@.]+[a-zA-Z0-9]{1,}').test(query))
    // console.info('req.params.query', query, 'isQueryValid', isQueryValid)
    if (isQueryValid) {
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
      req.queries = params
      // console.info('getParams(query)', params)
      next()
    } else throw Error('Bad Format', 'Invalid Request URL format')
  } catch (error) {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
}

const removeFields = (object) => {
  if (object == null) return object
  console.log('::::::::::::::::::::>>>>>>>>Array.isArray(object)', Array.isArray(object))
  if (Array.isArray(object)) {
    object = object.map(obj => {
      let result = obj.dataValues
      console.log('::::::::::::::::::::>>>>>>>>(typeof result.user).toString()', (typeof result.user).toString())
      if (result.user) {
        result.user = remover(result.user)
      } else {
        result = remover(result)
      }
      return result
    })
    return object
  } else {
    if (object.dataValues == null) return object
    if (object.dataValues.id == null) return object
    let result = object.dataValues
    console.log('::::::::::::::::::::>>>>>>>>result.id == null', result.id == null)
    console.log('::::::::::::::::::::>>>>>>>>(typeof result.user).toString()', (typeof result.user).toString())
    if (result.user) {
      result.user = remover(result.user)
    } else {
      result = remover(result)
    }
    return result
  }
}
function remover (object) {
  delete object.password
  delete object.isApproved
  delete object.activationKey
  delete object.spam
  delete object.deleted
  delete object.addressId
  delete object.pictureId
  delete object.machineId
  delete object.userId
  // delete object.createdAt
  // delete object.updatedAt
  return object
}
export { authUser, getParams, removeFields }
