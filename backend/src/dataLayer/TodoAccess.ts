import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const XAWS = AWSXRay.captureAWS(AWS);

import { TodoItem } from "../models/TodoItem";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";

import { createLogger } from "../utils/logger";

const logger = createLogger("access-logger");

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoItemsTable = process.env.TODO_ITEMS_TABLE,
    private readonly userIdIndex = process.env.USER_ID_INDEX
  ) {}

  async getAllTodosByUserId(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.todoItemsTable,
        IndexName: this.userIdIndex,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
      .promise();
    return result.Items as TodoItem[];
  }

  async getTodo(todoId: string, userId: string): Promise<TodoItem> {
    // TODO: assert user here
    const result = await this.docClient
      .query({
        TableName: this.todoItemsTable,
        KeyConditionExpression: "todoId = :todoId",
        ExpressionAttributeValues: {
          ":todoId": todoId,
        },
      })
      .promise();

    if (result.Items[0].userId === userId) return result.Items[0] as TodoItem;

    logger.error("Todo corresponding to the given user id does not exist");
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todoItemsTable,
        Item: todoItem,
      })
      .promise();

    return todoItem;
  }

  async updateTodo(
    todoId: string,
    userId: string,
    updatedTodo: UpdateTodoRequest
  ) {
    const item = await this.getTodo(todoId, userId);

    if (item) {
      const { createdAt } = item;
      const result = await this.docClient
        .update({
          TableName: this.todoItemsTable,
          Key: {
            todoId,
            createdAt,
          },
          UpdateExpression:
            "set #todoName = :nameValue, dueDate = :dueDate, done = :done",
          ExpressionAttributeValues: {
            ":nameValue": updatedTodo.name,
            ":dueDate": updatedTodo.dueDate,
            ":done": updatedTodo.done,
          },
          ExpressionAttributeNames: {
            "#todoName": "name",
          },
          ReturnValues: "UPDATED_NEW",
        })
        .promise();

      return result.Attributes as TodoItem;
    } else {
      logger.warn(`${todoId}, ${userId}, ${item}`);
    }
  }

  async deleteTodo(todoId: string, userId: string) {
    const item = await this.getTodo(todoId, userId);

    if (item) {
      const { createdAt } = item;
      const result = await this.docClient
        .delete({
          TableName: this.todoItemsTable,
          Key: {
            todoId,
            createdAt,
          },
          ReturnValues: "ALL_OLD",
        })
        .promise();
      return result.Attributes as TodoItem;
    } else {
      logger.warn(`${todoId}, ${userId}, ${item}`);
    }
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log("Creating a local DynamoDB instance");
    return new XAWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
    });
  }

  return new XAWS.DynamoDB.DocumentClient();
}
