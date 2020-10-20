
import { Router } from 'express'
import { User, Address } from '../sequelize/db/models'
import { authUser, checkRole, getParams } from '../middleware/auth'

const router = Router()
router.get('/:id', authUser, checkRole(['Admin']), async (req, res) => {
  const where = req.params.id ? { id: req.params.id } : {}
  const address = await Address.findOne({
    include: [{ model: User, as: 'user' }],
    where
  }).catch((error) => {
    res.send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(address)
})

router.get('/mine', authUser, async (req, res) => {
  const where = { id: req.userId }
  const address = await Address.findOne({
    include: [{ model: User, as: 'user' }],
    where
  }).catch((error) => {
    res.send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(address)
})

router.post('', async (req, res, next) => {
  const body = req.body
  console.log(body)
  const address = await Address.create(body).catch((error) => {
    res.send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(address)
})

router.get('', authUser, checkRole(['Admin']), async (req, res) => {
  const addresses = await Address.findAll({
    include: [{ model: User, as: 'user' }],
    offset: 0,
    limit: 10
  }).catch((error) => {
    res.send({ name: error.name, message: error.message, stack: error.stack })
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
    }).catch((error) => {
      res.send({ error: { name: error.name, message: error.message, stack: error.stack } })
    })
    res.send(addresses)
  } else {
    res.json({
      error: {
        message: 'Bad Request URL format',
        stack: ''
      }
    })
  }
})

export default router
