import { Router } from 'express'
import { Transaction, Payment, Job } from '../sequelize/models'
import { getParams, removeFields } from '../middleware/auth'

const router = Router()

router.get('/:id(\\d+)', async (req, res) => {
  const where = req.params.id ? { id: req.params.id } : {}
  const transaction = await Transaction.findOne({
    include: [{ model: Payment, as: 'payment' }, { model: Job, as: 'job' }],
    where
  }).catch((error) => {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  })
  res.send(removeFields(transaction))
})

router.post('', async (req, res) => {
  try {
    const body = req.body
    if (body.paymentId && body.amount) {
      const payment = await Payment.findOne({ where: { id: body.paymentId } })
      if (payment) {
        if (payment.balance > body.amount) {
          const currentBalance = payment.balance - body.amount
          const rows = await Payment.update({ balance: currentBalance }, { where: { id: body.paymentId } }) || []
          const _transaction = await Transaction.create(body)
          const result = rows.length > 0 ? await Transaction.findOne({
            include: [{ model: Payment, as: 'payment' }, { model: Job, as: 'job' }],
            where: { id: _transaction.id }
          }) : null
          res.send(removeFields(result))
        } else {
          res.status(400).send({ name: 'Low Balance', message: 'Your balance is insufficient, please recharge your balance', stack: '' })
        }
      } else {
        res.status(400).send({ name: 'Bad Input', message: 'You can\'t perform any transaction, please set your billing info first', stack: '' })
      }
    } else {
      res.status(400).send({ name: 'Bad Input', message: 'The transaction body has missing feilds, e.g paymentId, jobId & amont', stack: '' })
    }
  } catch (error) {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  }
})

router.put('', async (req, res) => {
  const body = req.body
  try {
    if (body) {
      if (body.id) {
        const _transaction = await Transaction.findOne({ where: { id: body.id }, include: [{ model: Payment, as: 'payment' }, { model: Job, as: 'job' }] })
        if (_transaction) {
          body.jobId = body.jobId || _transaction.jobId
          body.amount = body.amount || _transaction.amount
          delete body.createdAt
          delete body.updatedAt
          if ((_transaction.payment.balance + _transaction.amount) > body.amount) {
            const _new = (_transaction.payment.balance + _transaction.amount) - body.amount
            const rows1 = await Payment.update({ balance: _new }, { where: { id: _transaction.payment.id } })
            const rows2 = rows1.length > 0 ? await Transaction.update(body, { where: { id: body.id } }) : []
            const result = rows2.length > 0 ? await Transaction.findOne({
              where: { id: body.id },
              include: [{ model: Payment, as: 'payment' }, { model: Job, as: 'job' }]
            }) : null
            res.status(200).send({ rows: rows2 ? rows2[0] : 0, result: removeFields(result) })
          } else {
            res.status(400).send({ name: 'Low Balance', message: 'Your balance is insufficient, please recharge your balance', stack: '' })
          }
        } else throw Error('Transaction not found')
      } else throw Error('Transaction ID is Missing')
    } else throw Error('Your Request Body is Null')
  } catch (error) {
    res.status(400).send({ name: error.name, message: error.message, stack: error.stack, location: 'Transaction PUT method' })
  }
})

router.get('', async (req, res) => {
  const amount = await Transaction.count()
  const params = { page: 1, limit: 25, order: 'DESC', sort: 'id', where: {} }
  const transactions = await Transaction.findAll({
    where: params.where,
    include: [{ model: Payment, as: 'payment' }, { model: Job, as: 'job' }],
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  })
  res.set({ 'X-Total-Count': amount, 'Access-Control-Expose-Headers': 'X-Total-Count' }).send(removeFields(transactions))
})

router.get('/:query', getParams, async (req, res, next) => {
  const params = req.queries
  const amount = await Transaction.count()
  const transactions = await Transaction.findAll({
    include: [{ model: Payment, as: 'payment' }, { model: Job, as: 'job' }],
    where: params.where,
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(400).send({ name: error.name, message: error.message, stack: error.stack })
  })
  res.set({ 'X-Total-Count': amount, 'Access-Control-Expose-Headers': 'X-Total-Count' }).send(removeFields(transactions))
})

export default router
