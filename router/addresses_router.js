
import { Router } from 'express'
import { User, Address, Job } from '../sequelize/db/models'
import { authUser, checkRole, getParams } from '../middleware/auth'

const router = Router()
router.get('/:id', authUser, checkRole(['Admin']), async (req, res) => {
  const where = { id: req.params.id }
  Address.findOne({
    include: [{ model: User, as: 'user' }, { model: Job, as: 'job' }],
    where
  }).then((request) => {
    if (request) res.send(request)
    else res.status(404).send({ error: { name: 'Resource not found', message: 'No Offer Found', stack: '' } })
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
})

router.get('/me', authUser, async (req, res) => {
  const where = { id: req.userId }
  const address = await Address.findOne({
    include: [{ model: User, as: 'user' }, { model: Job, as: 'job' }],
    where
  }).catch((error) => {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
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
    include: [{ model: User, as: 'user' }, { model: Job, as: 'job' }],
    offset: 0,
    limit: 25
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
      include: [{ model: User, as: 'user' }, { model: Job, as: 'job' }],
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
