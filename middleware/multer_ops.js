const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname.split('.')[0] + '-' + Date.now() + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  // reJect File
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') cb(null, true)
  else { cb(new Error('This fileType is not supported, please use only images with jpg/png extention'), false) }
}
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024
  }
})

module.exports = upload
