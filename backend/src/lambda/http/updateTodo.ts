import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { UpdateTodoRequest } from "../../requests/UpdateTodoRequest";
import { updateTodo } from "../../businessLogic/todos";
import { getUserId } from "../utils";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { createLogger } from "../../utils/logger";

const logger = createLogger("update-log");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);

    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    logger.info(event.headers);
    const userId = getUserId(event);
    try {
      await updateTodo(todoId, userId, updatedTodo);
      return {
        statusCode: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({}),
      };
    } catch (e) {
      logger.error(`Update todo error ${e.message}`);

      return {
        statusCode: 500,
        body: JSON.stringify({}),
      };
    }
  }
);

handler.use(cors());
