import { Router } from 'express'
import { Machine, Machinery, Picture } from '../../sequelize/db/models'
import { authUser, checkRole } from '../../middleware/auth'

const router = Router()

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  const machine = await Machine.findOne({
    include: [{ model: Machinery, as: 'machinery' }, { model: Picture, as: 'picture' }],
    where: { id: id }
  })
  res.send(machine)
})

router.post('', authUser, checkRole(['Admin']), async (req, res) => {
  const body = req.body
  let machine = {}
  console.log(body)
  machine = await Machine.create(body)
  res.send(machine)
})

router.put('', authUser, checkRole(['Admin']), async (req, res, err) => {
  const body = req.body
  const respones = { isSuccess: true, updatedRows: [], message: [] }
  if (body.id) {
    const rows = await Machine.update(body, { where: { id: body.id } })
    if (rows > 0) {
      respones.updatedRows.push({ machine: rows })
    } else {
      respones.isSuccess = false
      respones.message.push('Failed to UPDATE machine information')
    }
  }
  res.send(respones)
})

export default router
