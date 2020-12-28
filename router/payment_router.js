import { Router } from 'express'
import { Payment, User } from '../sequelize/models'
import { getParams, removeFields } from '../middleware/auth'

const router = Router()

router.get('/:id(\\d+)', async (req, res) => {
  const where = req.params.id ? { id: req.params.id } : {}
  const payment = await Payment.findOne({
    include: [{ model: User, as: 'user' }],
    where
  }).catch((error) => {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  })
  res.send(removeFields(payment))
})

router.post('', async (req, res) => {
  try {
    const body = req.body
    console.log(body)
    const _payment = await Payment.create(body)
    const response = await Payment.findOne({
      include: [{ model: User, as: 'user' }],
      where: { id: _payment.id }
    })
    res.send(removeFields(response))
  } catch (error) {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  }
})

router.put('', async (req, res) => {
  const body = req.body
  try {
    if (body) {
      if (body.id) {
        const _payment = await Payment.findOne({ where: { id: body.id } })
        if (_payment) {
          body.userId = body.userId || _payment.userId
          body.balance = body.balance || _payment.balance
          body.lastDeposit = body.lastDeposit || _payment.lastDeposit
          body.totalDeposit = body.totalDeposit || _payment.totalDeposit
          delete body.createdAt
          delete body.updatedAt
          const rows = await Payment.update(body, { where: { id: body.id } }) || []
          const result = rows.length > 0 ? await Payment.findOne({
            where: { id: body.id },
            include: [{ model: User, as: 'user' }]
          }) : null
          res.status(200).send({ rows: rows ? rows[0] : 0, result: removeFields(result) })
        } else throw Error('Payment not found')
      } else throw Error('Payment ID is Missing')
    } else throw Error('Your Request Body is Null')
  } catch (error) {
    res.status(400).send({ name: error.name, message: error.message, stack: error.stack, location: 'Payment PUT method' })
  }
})

router.put('/recharge', async (req, res) => {
  const { id, balance } = req.body
  try {
    if (req.body) {
      if (id && balance) {
        const _payment = await Payment.findOne({ where: { id } })
        if (_payment) {
          const newBody = {
            balance: balance + _payment.balance,
            lastDeposit: balance,
            totalDeposit: balance + _payment.totalDeposit
          }
          const rows = await Payment.update(newBody, { where: { id } }) || []
          const result = rows.length > 0 ? await Payment.findOne({
            where: { id },
            include: [{ model: User, as: 'user' }]
          }) : null
          res.status(200).send({ rows: rows ? rows[0] : 0, result: removeFields(result) })
        } else throw Error('Payment not found')
      } else throw Error('Payment ID is Missing')
    } else throw Error('Your Request Body is Null')
  } catch (error) {
    res.status(400).send({ name: error.name, message: error.message, stack: error.stack, location: 'Payment PUT method' })
  }
})

router.get('', async (req, res) => {
  const amount = await Payment.count()
  const params = { page: 1, limit: 25, order: 'DESC', sort: 'id', where: {} }
  const payments = await Payment.findAll({
    where: params.where,
    include: [{ model: User, as: 'user' }],
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  })
  res.set({ 'X-Total-Count': amount, 'Access-Control-Expose-Headers': 'X-Total-Count' }).send(removeFields(payments))
})

router.get('/:query', getParams, async (req, res, next) => {
  const params = req.queries
  const amount = await Payment.count()
  const payments = await Payment.findAll({
    include: [{ model: User, as: 'user' }],
    where: params.where,
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(400).send({ name: error.name, message: error.message, stack: error.stack })
  })
  res.set({ 'X-Total-Count': amount, 'Access-Control-Expose-Headers': 'X-Total-Count' }).send(removeFields(payments))
})

export default router
