# serverless-image-moderation-cdk

## About

This is a serverless image moderation service. The service uses Amazon Rekognition to detect unsafe images and Amazon S3 to store the images. The service is built using AWS CDK and is written in Typescript.

## Architecture

Lambda function is triggered when an image is uploaded to the S3 bucket. The Lambda function uses Amazon Rekognition to detect unsafe images. If an unsafe image is detected, the image is moved to a quarantine S3 bucket. If the image is safe, the image will stay in the original S3 bucket.

## Pre-requisites

- Node.js
- AWS CLI (configured with the necessary permissions)
- AWS CDK (installed globally)

## Project Structure

This is a default project sturecture that AWS CDK provides. The `lib` directory contains the main stack file. The `bin` directory contains the entry point for the CDK application. The `lambda` directory contains the lambda function code.

- `lambda/image-moderation.ts` - Code for the Lambda function that is triggered when an image is uploaded to the S3 bucket.

## Deployment

To deploy the CDK application, run `cdk deploy` in the root directory of the project. This will deploy the stack to your default AWS account.

**Note:** If this is the first time you are deploying a CDK application, you will be prompted to bootstrap the CDK toolkit. Run `cdk bootstrap` to do this.

**Note:** If you have multiple AWS profiles, you can specify the profile to use by running `cdk deploy --profile <profile-name>`.

## Cleanup

To delete the stack, run `cdk destroy` in the root directory of the project.

## Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/api/v2/)
- [AWS CLI](https://aws.amazon.com/cli/)
- [Amazon Rekognition](https://aws.amazon.com/rekognition/)
- [Amazon S3](https://aws.amazon.com/s3/)
- [AWS Lambda](https://aws.amazon.com/lambda/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
