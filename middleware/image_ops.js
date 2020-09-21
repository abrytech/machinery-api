import models from '../db/models'
import path from 'path'
import fs from 'fs'

const Op = require('sequelize').Op

const storeFS = ({ stream, filename }) => {
  const filepath = path.join(__dirname, '../public/pictures', filename)
  return new Promise((resolve, reject) =>
    stream
      .on('error', error => {
        if (stream.truncated) { fs.unlinkSync(filepath) }
        reject(error)
      })
      .pipe(fs.createWriteStream(filepath))
      .on('error', error => reject(error))
      .on('finish', () => resolve({ filepath }))
  )
}

const getPictures = async (params) => {
  const totalPictures = await models.Picture.count()
  const pictures = await models.Picture.findAll({
    where: params.where,
    offset: (params.page - 1) * params.limit,
    limit: params.limit
  })
  return {
    pictures,
    page: params.page,
    totalPictures
  }
}

const getPicture = async (id) => {
  const picture = await models.Picture.findOne({ where: { id } })
  console.log('Picturefile :', picture)
  return picture
}

 const addPicture = async ({ file, ownerId }) => {
  const { createReadStream, filename, mimetype, encoding } = await file
  const timeStamp = new Date().getTime()
  const fn = filename.substring(0, filename.indexOf("."))
  const ext = filename.substring(filename.indexOf("."), filename.length)
  const name = `${fn}_${timeStamp}.${ext}`
  const stream = await createReadStream()
  await storeFS({ stream, name })
  const picture = await models.Picture.create({ fileName: name, filePath: '/', ownerId })
  return picture
}

  const addPictures = async ({ files, ownerId }) => {
  const pictures = []
  try {
    await files.forEach(async picture => {
      pictures.push(await addPicture(picture, ownerId))
    })
    return pictures
  } catch (error) {
    throw new Error(error)
  }
}

  const editPicture = async (params) => {
  const { id, ownerId } = params
  const { encoding, mimetype, createReadStream, filename } = await params.file
  const timeStamp = new Date().getTime()
  const fn = filename.substring(0, filename.indexOf("."))
  const ext = filename.substring(filename.indexOf("."), filename.length)
  const name = `${fn}_${timeStamp}.${ext}`
  const stream = createReadStream()
  await storeFS({ stream, name })
  const picture = await models.Picture
    .update({ fileName: name, filePath: '/', ownerId }, {
      where: { id }
    })
  return picture
}

 const deletePicture = async (params) => {
  const { id } = params
  await models.Picture.destroy({ where: { id } })
  return id
}

 const searchPictures = async (params) => {
  const { searchQuery } = params
  const pictures = await models.Picture.findAll({
    where: {
      [Op.or]: [
        {
          description: {
            [Op.like]: `%${searchQuery}%`
          }
        },
        {
          tags: {
            [Op.like]: `%${searchQuery}%`
          }
        }
      ]
    }
  })
  const totalPictures = await models.Picture.count()
  return { pictures, totalPictures }
}

module.exports = { getPicture, getPictures, addPicture, addPictures, editPicture, deletePicture, searchPictures}