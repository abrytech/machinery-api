import { Router } from 'express'
import { User, Address, Picture } from '../../sequelize/db/models'
import { authUser, checkRole } from '../../middleware/auth'

const router = Router()

router.get('', authUser, checkRole(['Admin']), async (req, res) => {
  const users = await User.findAll({
    include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }],
    offset: 0,
    limit: 10
  }).catch((error) => {
    res.send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(users)
})
router.get('/:query', authUser, checkRole(['Admin']), async (req, res, err) => {
  const query = req.params.query
  const isQueryValid = !(new RegExp('[^a-zA-Z0-9&=@.]').test(query))
  if (isQueryValid) {
    const params = getParams(query)
    const users = await User.findAll({
      where: params.where,
      include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }],
      offset: (params.page - 1) * params.limit,
      limit: params.limit
    }).catch((error) => {
      res.send({ error: { name: error.name, message: error.message, stack: error.stack } })
    })
    res.send(users)
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

function getParams (query) {
  const params = { page: 1, limit: 10, where: {} }
  const temp = query.split('&')
  temp.forEach((param) => {
    const key = param.split('=')[0]
    const value = param.split('=')[1]
    if (key && value) {
      if (key === 'page' || key === 'limit') { params[key] = parseInt(value) } else {
        params.where[key] = value
      }
    }
  })
  console.log(params)
  return params
}

export default router
