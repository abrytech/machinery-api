
import { Router } from 'express'
import { User, Address } from '../../sequelize/db/models'
const router = Router()

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  const address = await Address.findOne({
    include: [{ model: User, as: 'user' }],
    where: { id: id }
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
