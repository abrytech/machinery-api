import { Router } from 'express'
import { Machinery, User, Machine, Picture } from '../../sequelize/db/models'
const router = Router()

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  const machinery = await Machinery.findOne({
    include: [{ model: User, as: 'user' }, { model: Machine, as: 'machine' }, { model: Picture, as: 'pictures' }],
    where: { id: id }
  })
  res.send(machinery)
})

router.post('', async (req, res) => {
  const body = req.body
  let machinery = {}
  console.log(body)
  machinery = await Machinery.create(body)
  res.send(machinery)
})

router.put('', async (req, res, err) => {
  const body = req.body
  const respones = { isSuccess: true, updatedRows: [], message: [] }
  if (body.id) {
    const rows = await Machinery.update(body, { where: { id: body.id } })
    if (rows > 0) {
      respones.updatedRows.push({ machinery: rows })
    } else {
      respones.isSuccess = false
      respones.message.push('Failed to UPDATE machinery information')
    }
  }
  res.send(respones)
})

export default router
