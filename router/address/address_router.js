
import { Router } from 'express'
import { User, Address } from '../../sequelize/db/models'
import { authUser, checkRole } from '../../middleware/auth'

const router = Router()

router.get('/:id', authUser, checkRole(['Admin']), async (req, res) => {
  const where = req.params.id ? { id: req.params.id } : {}
  const address = await Address.findOne({
    include: [{ model: User, as: 'user' }],
    where
  })
  res.send(address)
})

router.get('/mine', authUser, async (req, res) => {
  const where = { id: req.userId }
  const address = await Address.findOne({
    include: [{ model: User, as: 'user' }],
    where
  })
  res.send(address)
})

router.post('', async (req, res, next) => {
  const body = req.body
  let address = {}
  console.log(body)
  address = await Address.create(body)
  res.send(address)
})
export default router
