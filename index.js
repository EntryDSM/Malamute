const aws = require('aws-sdk');
const sharp = require('sharp');

const s3 = new aws.S3({region: 'ap-northeast-2'});

exports.handler = async (event, context, callback) => {
    const bucket = event.Records[0].s3.bucket.name;
    const key = event.Records[0].s3.object.key;
    
    try {
        const s3Object = await s3.getObject({
            Bucket: bucket,
            Key: key
        })
        .promise()
        .then(data => sharp(data.Body)
            .resize(113, 151)
            .withMetadata()
            .toBuffer()
        );

        s3.putObject({
            Bucket: bucket,
            Key: `resize/${key}`,
            Body: s3Object,
        })
        .promise()
        .then(err => {
            if (err) {
                console.error(err);
                return callback(err);
            }
            return callback(null, `resize/${key}`);
        })

    } catch (err) {
        console.error(err);
        return callback(err);
    }
}