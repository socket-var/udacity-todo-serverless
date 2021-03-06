import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { CreateTodoRequest } from "../../requests/CreateTodoRequest";

import { createTodo } from "../../businessLogic/todos";
import { getUserId } from "../utils";
import { createLogger } from "../../utils/logger";
import * as middy from "middy";
import { cors } from "middy/middlewares";

const logger = createLogger("create-log");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body);

    const userId = getUserId(event);

    try {
      const item = await createTodo(newTodo, userId);
      return {
        statusCode: 201,
        body: JSON.stringify({
          item,
        }),
      };
    } catch (e) {
      logger.error("Create todo error", e.message);
      return {
        statusCode: 500,
        body: JSON.stringify({}),
      };
    }
  }
);

handler.use(
  cors({
    credentials: true,
  })
);
