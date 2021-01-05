import { Router } from 'express'
import { Payment, User, Transaction } from '../sequelize/models'
import { getParams, removeFields } from '../middleware/auth'

const router = Router()

router.get('/:id(\\d+)', async (req, res) => {
  const where = req.params.id ? { id: req.params.id } : {}
  const payment = await Payment.findOne({
    include: [{ model: User, as: 'user' }, { model: Transaction, as: 'transactions' }],
    where
  }).catch((error) => {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  })
  res.send(removeFields(payment))
})

router.post('', async (req, res) => {
  const { balance, userId } = req.body
  try {
    if (balance && userId) {
      const body = { balance, userId, lastDeposit: balance, totalDeposit: balance }
      const _payment = await Payment.create(body)
      const response = await Payment.findOne({
        include: [{ model: User, as: 'user' }, { model: Transaction, as: 'transactions' }],
        where: { id: _payment.id }
      })
      res.send(removeFields(response))
    } else {
      res.status(400).send({ name: 'Bad Input', message: 'The payment request body has missing feilds, e.g balance & userId', stack: '' })
    }
  } catch (error) {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  }
})

router.put('', async (req, res) => {
  const body = req.body
  try {
    if (body) {
      if (body.id && body.balance) {
        const _payment = await Payment.findOne({ where: { id: body.id } })
        if (_payment) {
          body.userId = body.userId || _payment.userId
          body.balance = body.balance || _payment.balance
          delete body.createdAt
          delete body.updatedAt
          const rows = await Payment.update(body, { where: { id: body.id } }) || []
          const result = rows.length > 0 ? await Payment.findOne({
            where: { id: body.id },
            include: [{ model: User, as: 'user' }]
          }) : null
          res.status(200).send({ rows: rows ? rows[0] : 0, result: removeFields(result) })
        } else throw Error('Payment not found')
      } else throw Error('The payment request body has missing feilds, e.g balance & ID')
    } else throw Error('Your Request Body is Null')
  } catch (error) {
    res.status(400).send({ name: error.name, message: error.message, stack: error.stack, location: 'Payment PUT method' })
  }
})

router.put('/recharge', async (req, res) => {
  try {
    const { id, balance } = req.body
    if (req.body) {
      if (id && balance) {
        const _payment = await Payment.findOne({ where: { id } })
        if (_payment) {
          const newBody = {
            balance: balance * 1.0 + _payment.balance * 1.0,
            lastDeposit: balance,
            totalDeposit: balance * 1.0 + _payment.totalDeposit * 1.0
          }
          const rows = await Payment.update(newBody, { where: { id } }) || []
          const result = rows.length > 0 ? await Payment.findOne({
            where: { id },
            include: [{ model: User, as: 'user' }]
          }) : null
          res.status(200).send({ rows: rows ? rows[0] : 0, result: removeFields(result) })
        } else throw Error('Payment not found')
      } else throw Error('The payment request body has missing feilds, e.g balance & ID')
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
    include: [{ model: User, as: 'user' }, { model: Transaction, as: 'transactions' }],
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
    include: [{ model: User, as: 'user' }, { model: Transaction, as: 'transactions' }],
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
