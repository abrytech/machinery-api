import { Router } from 'express'
import { Machine, Machinery, Picture } from '../../sequelize/db/models'
import { authUser, checkRole } from '../../middleware/auth'
// import fs from 'fs'

// import path from 'path'
import { deleteFileFromS3, uploadFileIntoS3 } from '../../middleware/aws'
// const www = process.env.WWW || './public/'
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
  const _machine = await Machine.create(body)
  if (!req.files || Object.keys(req.files || []).length === 0) {
    throw new Error('No files were uploaded.')
  } else if (_machine) {
    const image = req.files.file
    const pic = await uploadFileIntoS3(image)
    pic.machineId = _machine.id
    const _picture = await Picture.create(pic)
    console.log(`[user] [put] _picture.id: ${_picture.id}`)
  }
  const response = await Machine.findOne({
    include: [{ model: Machinery, as: 'machinery' }, { model: Picture, as: 'picture' }],
    where: { id: _machine.id }
  })
  res.send(response)
})

router.put('', authUser, checkRole(['Admin']), async (req, res, err) => {
  const body = req.body
  if (body.id) {
    const _machine = await Machine.findOne(body, { where: { id: body.id } })
    body.name = body.name || _machine.name
    body.description = body.description || _machine.description
    body.parentId = body.parentId || _machine.parentId
    body.isLowbed = body.isLowbed || _machine.isLowbed
    if (req.files || Object.keys(req.files || []).length !== 0) {
      const image = req.files.file
      const pics = await Picture.findAll({ where: { machineId: body.id } })
      pics.forEach(element => {
        if (element.fileName) deleteFileFromS3(element.fileName)
      })
      const pic = await uploadFileIntoS3(image)
      pic.machineId = body.id
      await Picture.destroy({ where: { machineId: body.id } })
      const _picture = await Picture.create(pic)
      console.log(`[user] [put] _picture.id: ${_picture.id}`)
    }
    await Machine.update(body, { where: { id: body.id } })
    const response = await Machine.findOne({
      include: [{ model: Machinery, as: 'machinery' }, { model: Picture, as: 'picture' }],
      where: { id: body.id }
    })
    res.send(response)
  }
})
export default router
