import { Context, S3Event } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import {
  RekognitionClient,
  DetectModerationLabelsCommand,
  DetectModerationLabelsCommandInput,
} from '@aws-sdk/client-rekognition';
import { CopyObjectCommand, S3Client } from '@aws-sdk/client-s3';

const logger = new Logger({ serviceName: 'image-moderation' });
const rekognition = new RekognitionClient();
const s3 = new S3Client();

export const handler = async (event: S3Event, _context: Context) => {
  logger.logEventIfEnabled(event);

  const quarantineBucket = process.env.QUARANTINE_BUCKET_NAME;
  if (!quarantineBucket) {
    logger.error('QUARANTINE_BUCKET_NAME environment variable is not set');
    throw new Error('QUARANTINE_BUCKET_NAME environment variable is not set');
  }

  for (const record of event.Records) {
    const bucketName = record.s3.bucket.name;
    const objectKey = record.s3.object.key;

    const params: DetectModerationLabelsCommandInput = {
      Image: {
        S3Object: {
          Bucket: bucketName,
          Name: objectKey,
        },
      },
      MinConfidence: 60,
    };

    try {
      const detectModerationLabels = await rekognition.send(
        new DetectModerationLabelsCommand(params)
      );
      logger.info('Detected Moderation Labels', {
        data: detectModerationLabels,
      });

      if (
        !detectModerationLabels.ModerationLabels ||
        detectModerationLabels.ModerationLabels.length === 0
      ) {
        logger.info('No Labels Detected');
        continue;
      }

      await s3.send(
        new CopyObjectCommand({
          Bucket: quarantineBucket,
          CopySource: encodeURIComponent(`${bucketName}/${objectKey}`),
          Key: objectKey,
        })
      );
      logger.info('Object Moved', { bucketName: bucketName, key: objectKey });
    } catch (error) {
      logger.error('Something Went Wrong', { error: error });
    }
  }
};
