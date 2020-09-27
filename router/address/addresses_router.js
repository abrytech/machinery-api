
import { Router } from 'express'
import { User, Address } from '../../sequelize/db/models'
import { authUser, checkRole } from '../../middleware/auth'

const router = Router()

router.get('', authUser, checkRole(['Admin']), async (req, res) => {
  const addresses = await Address.findAll({
    include: [{ model: User, as: 'user' }],
    offset: 0,
    limit: 10
  })
  res.send(addresses)
})
router.get('/:query', authUser, checkRole(['Admin']), async (req, res, err) => {
  const query = req.params.query
  const isQueryValid = !(new RegExp('[^a-zA-Z0-9&=@.]').test(query))
  if (isQueryValid) {
    const params = getParams(query)
    const addresses = await Address.findAll({
      where: params.where,
      include: [{ model: User, as: 'user' }],
      offset: (params.page - 1) * params.limit,
      limit: params.limit
    })
    res.send(addresses)
  } else {
    res.json({
      error: {
        name: 'Bad Format',
        message: 'Invalid Request URL format',
        stack: ''
      }
    })
  }
})

export default router

function getParams (query) {
  const params = { page: 1, limit: 10, where: {} }
  const temp = query.split('&')
  temp.forEach((param) => {
    const key = param.split('=')[0]
    const value = param.split('=')[1]
    if (key && value) {
      if (key === 'username' || key === 'email' || key === 'phone') {
        params.where[key] = value
      } else {
        if (key === 'page' || key === 'limit') { params[key] = parseInt(value) }
      }
    }
  })
  console.log(params)
  return params
}
