const aws = require('aws-sdk');
const sharp = require('sharp');

const s3 = new aws.S3({region: 'ap-northeast-2'});

exports.handler = (event, context, callback) => {
    const bucket = event.Records[0].s3.bucket.name;
    const key = event.Records[0].s3.object.key;
    const ext = key.split('.')[1];
    const filename = key.split('/')[1];

    s3.getObject({
        Bucket: bucket,
        Key: key
    })
    .promise()
    .then(data => sharp(data.Body)
        .resize(90, 108)
        .toFormat(ext, { quality: 75})
        .withMetadata()
        .toBuffer()
    )
    .then(buffer => s3.putObject({
            Bucket: bucket,
            Key: `${filename}`,
            Body: buffer
        }).promise()
    )
    .then(() => s3.deleteObject({
            Bucket: bucket,
            Key: key
        }).promise()
    )
    .then(() => callback(null, `${key}`))
    .catch(err => callback(err))

}