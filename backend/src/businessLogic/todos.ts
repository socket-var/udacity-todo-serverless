import * as uuid from "uuid";

import { TodoItem } from "../models/TodoItem";
import { TodoAccess } from "../dataLayer/TodoAccess";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";

const todoAccess = new TodoAccess();

export async function getAllTodosByUserId(userId): Promise<TodoItem[]> {
  return await todoAccess.getAllTodosByUserId(userId);
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4();

  return await todoAccess.createTodo({
    todoId,
    userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString(),
    done: false,
  });
}

export async function updateTodo(
  todoId: string,
  userId: string,
  updateTodoRequest: UpdateTodoRequest
) {
  await todoAccess.updateTodo(todoId, userId, updateTodoRequest);
}

export async function deleteTodo(todoId: string, userId: string) {
  await todoAccess.deleteTodo(todoId, userId);
}

export async function getImageUrl(
  todoId: string,
  userId: string
): Promise<string> {
  return todoAccess.getUploadUrl(todoId, userId);
}
