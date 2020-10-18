import { Router } from 'express'
import { Machine, Machinery, Picture } from '../../sequelize/db/models'
import { authUser, checkRole } from '../../middleware/auth'
import fs from 'fs'

import path from 'path'
const www = process.env.WWW || './public/'
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
  if (!req.files || Object.keys(req.files).length === 0) {
    throw new Error('No files were uploaded.')
  } else if (_machine) {
    const image = req.files.file
    const fileName = image.name.split('.')[0] + '-' + Date.now() + path.extname(image.name)
    const filePath = www + 'uploads/images/' + fileName
    image.mv(filePath, async (error) => {
      if (error) {
        console.log("Couldn't upload the image file")
        throw error
      } else {
        console.log('Image file succesfully uploaded.')
        const machineId = _machine.id
        const pic = { fileName: fileName, filePath: filePath, fileSize: image.size, mimeType: image.mimetype }
        if (machineId) pic.machineId = parseInt(machineId)
        const _picture = await Picture.create(pic)
        console.log(`[machine] [post] _picture?.id ${_picture.id}`)
      }
    })
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
    _machine.name = body.name || _machine.name
    _machine.description = body.description || _machine.description
    _machine.parentId = body.parentId || _machine.parentId
    _machine.isLowbed = body.isLowbed || _machine.isLowbed
    if (req.files || Object.keys(req.files).length !== 0) {
      const image = req.files.file
      const fileName = image.name.split('.')[0] + '-' + Date.now() + path.extname(image.name)
      const filePath = www + 'uploads/images/' + fileName
      image.mv(filePath, async (error) => {
        if (error) {
          console.log("Couldn't upload the image file")
          throw error
        } else {
          console.log('Image file succesfully uploaded.')
          const machineId = req.body.id
          const pic = { fileName: fileName, filePath: filePath, fileSize: image.size, mimeType: image.mimetype }
          if (machineId) pic.machineId = parseInt(machineId)
          const pics = await Picture.findAll({ where: { machineId: body.id } })
          pics.forEach(element => { fs.unlink(element.filePath) })
          await Picture.destroy({ where: { machineId: body.id } })
          const _picture = await Picture.create(pic)
          console.log(`[machine] [put] _picture?.id ${_picture.id}`)
        }
      })
    }
    await Machine.update(_machine, { where: { id: body.id } })
    const response = await Machine.findOne({
      include: [{ model: Machinery, as: 'machinery' }, { model: Picture, as: 'picture' }],
      where: { id: _machine.id }
    })
    res.send(response)
  }
})
export default router
