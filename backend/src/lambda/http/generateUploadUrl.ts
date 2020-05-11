import "source-map-support/register";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";

import { createLogger } from "../../utils/logger";
import { getImageUrl } from "../../businessLogic/todos";
import { getUserId } from "../utils";

const logger = createLogger("generate-upload-url-log");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;

    const userId = getUserId(event);

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    try {
      const url = await getImageUrl(todoId, userId);
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
