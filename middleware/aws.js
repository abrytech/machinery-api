// import { createWriteStream } from 'fs'
import { S3 } from 'aws-sdk'
const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const uploadFileIntoS3 = async (file) => {
  const fileName = `${new Date().getTime()}_${file.name}`
  const mimetype = file.mimetype
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: file.data,
    ContentType: mimetype
  }
  const res = await new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => err == null ? resolve(data) : reject(err))
  })
  console.log('The uploaded picture', res)
  return { filePath: res.Location, fileName: res.Key, fileSize: file.size, mimeType: mimetype }
}

const deleteFileFromS3 = async (fileName) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName
  }
  console.warn('Parameters of the file going to be deleted', params)
  const res = await new Promise((resolve, reject) => {
    s3.deleteObject(params, function (err, data) {
      if (err) {
        console.log(err, err.stack) // error
        reject(err)
      } else {
        console.info('File Successfully Deleted!')
        resolve(data)
      }
    })
  })
  return res
}

export { uploadFileIntoS3, deleteFileFromS3 }
