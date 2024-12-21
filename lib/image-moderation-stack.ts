import * as cdk from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class ImageModerationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'ImageBucket', {
      bucketName: `${this.stackName.toLowerCase()}-image-bucket`,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const lambdaFunction = new NodejsFunction(this, 'ImageModerationFunction', {
      functionName: `${this.stackName.toLowerCase()}-image-moderation-function`,
      description: 'Moderates images uploaded to S3',
      entry: 'lambda/image-moderation/index.ts',
      runtime: Runtime.NODEJS_22_X,
      bundling: {
        minify: true,
        format: OutputFormat.ESM,
      },
      logRetention: RetentionDays.ONE_DAY,
    });

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(lambdaFunction)
    );

    lambdaFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['rekognition:DetectModerationLabels'],
        resources: ['*'],
        effect: iam.Effect.ALLOW,
      })
    );
  }
}
