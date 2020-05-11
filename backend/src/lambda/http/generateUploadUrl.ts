import "source-map-support/register";
import * as AWS from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";

import * as AWSXRay from "aws-xray-sdk";
import { createLogger } from "../../utils/logger";

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger("generate-upload-url-log");

const s3 = new XAWS.S3({
  signatureVersion: "v4",
});

const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    try {
      const url = getUploadUrl(todoId);
      return {
        statusCode: 201,
        body: JSON.stringify({
          uploadUrl: url,
        }),
      };
    } catch (e) {
      logger.error("Generate upload URL failed", e.message);
    }
  }
);

handler.use(cors({ credentials: true }));

function getUploadUrl(todoId: string) {
  return s3.getSignedUrl("putObject", {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration,
  });
}
