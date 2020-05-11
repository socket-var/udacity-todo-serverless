import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { getAllTodosByUserId } from "../../businessLogic/todos";
import { getUserId } from "../utils";
import { createLogger } from "../../utils/logger";
import { cors } from "middy/middlewares";
import * as middy from "middy";

const logger = createLogger("get-todos-log");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user

    const currentUserId = getUserId(event);

    try {
      const todos = await getAllTodosByUserId(currentUserId);
      return {
        statusCode: 200,
        body: JSON.stringify({
          items: todos,
        }),
      };
    } catch (e) {
      logger.error("Get todos failed", e.message);
      return {
        statusCode: 500,
        body: JSON.stringify({}),
      };
    }
  }
);

handler.use(cors({ credentials: true }));
