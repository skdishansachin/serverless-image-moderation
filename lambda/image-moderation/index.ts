import { Context, S3Event } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import {
  DetectLabelsCommand,
  DetectLabelsCommandInput,
  RekognitionClient,
} from '@aws-sdk/client-rekognition';

const logger = new Logger({ serviceName: 'image-moderation' });
const rekognition = new RekognitionClient();

export const handler = async (event: S3Event, _context: Context) => {
  logger.logEventIfEnabled(event);

  for (const record of event.Records) {
    const bucketName = record.s3.bucket.name;
    const objectKey = record.s3.object.key;

    const params: DetectLabelsCommandInput = {
      Image: {
        S3Object: {
          Bucket: bucketName,
          Name: objectKey,
        },
      },
    };

    try {
      const data = await rekognition.send(new DetectLabelsCommand(params));
      logger.info('Detected labels', { labels: data?.Labels });
    } catch (error) {
      logger.error('Error detecting labels', { error });
    }
  }
};
