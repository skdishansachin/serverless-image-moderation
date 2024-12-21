import { Context, S3Event } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import {
  RekognitionClient,
  DetectModerationLabelsCommand,
  DetectModerationLabelsCommandInput,
} from '@aws-sdk/client-rekognition';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

const logger = new Logger({ serviceName: 'image-moderation' });
const rekognition = new RekognitionClient();
const s3 = new S3Client();

export const handler = async (event: S3Event, _context: Context) => {
  logger.logEventIfEnabled(event);

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
      const detectModerationLabelsCommandOutput = await rekognition.send(
        new DetectModerationLabelsCommand(params)
      );
      logger.info('DetectModerationLabelsCommandOutput', {
        data: detectModerationLabelsCommandOutput,
      });

      if (!detectModerationLabelsCommandOutput.ModerationLabels) {
        logger.info('No Labels Detected');
        return;
      }

      await s3.send(
        new DeleteObjectCommand({ Bucket: bucketName, Key: objectKey })
      );
      logger.info('Object Deleted', { bucketName: bucketName, key: objectKey });
    } catch (error) {
      logger.error('Something Went Wrong', { error: error });
    }
  }
};
