// import fs from 'fs'
// import path from 'path'
// import { Picture } from '../../sequelize/db/models'

// const www = process.env.WWW || './public/'

// const createPictures = (req, res, next) => {
//   if (!req.files || Object.keys(req.files).length === 0) {
//     throw new Error('No files were uploaded.')
//   }
//   const image = req.files.file
//   const fileName = image.name.split('.')[0] + '-' + Date.now() + path.extname(image.name)
//   const filePath = www + 'uploads/images/' + fileName
//   image.mv(filePath, async (error) => {
//     if (error) {
//       console.log("Couldn't upload the image file")
//       throw error
//     } else {
//       console.log('Image file succesfully uploaded.')
//       const userId = req.userId
//       const machineId = req.body.machineId
//       const machineryId = req.body.machineryId
//       const pic = { fileName: fileName, filePath: filePath, fileSize: image.size, mimeType: image.mimetype }
//       if (userId) pic.userId = parseInt(userId)
//       if (machineId) pic.machineId = parseInt(machineId)
//       if (machineryId) pic.machineryId = parseInt(machineryId)
//       // console.log("Image file: >> "+ JSON.stringify(pic));
//       const picture = await Picture.create(pic)
//       next(picture)
//     }
//   })
// }

// const updatePictures = (req, res, next) => {

// }
// const checkPicturesExist = (req, res, next) => {

// }
// const deletePictures = (req, res, next) => {
//   fs.unlink(photo.path, function () {
//     res.send({
//       status: '200',
//       responseType: 'string',
//       response: 'success'
//     })
//   })
// }

// export { createPictures, updatePictures, checkPicturesExist, deletePictures }
