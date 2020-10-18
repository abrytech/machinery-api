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
    ContentType: mimetype,
    ACL: 'public-read'
  }
  const res = await new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => err == null ? resolve(data) : reject(err))
  })
  console.log(res)
  return { fileUrl: res.Location }
}

// const downloadFileFromS3 = (fileName) => {
//   const params = {
//     Bucket: process.env.AWS_S3_BUCKET,
//     Key: fileName // file will be saved as testBucket/contacts.csv
//   }
//   const file = createWriteStream('./download/index.html')
//   return new Promise((resolve, reject) => {
//     s3.getObject(params).createReadStream()
//       .on('end', () => {
//         return resolve()
//       })
//       .on('error', (error) => {
//         return reject(error)
//       }).pipe(file)
//   })
// }

const deleteFileFromS3 = (fileName) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName // file will be saved as testBucket/contacts.csv
  }
  s3.deleteObject(params, function (err, data) {
    if (err) console.log(err, err.stack) // error
    else console.log('File Successfully Deleted!')
  })
}

export { uploadFileIntoS3, deleteFileFromS3 }
