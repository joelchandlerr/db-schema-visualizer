import { type JSONTableSchema } from "shared/types/tableSchema";

export enum WebviewCommand {
  WEBVIEW_READY = "WEBVIEW_READY",
  SET_THEME_PREFERENCES = "SET_THEME_PREFERENCES",
}

export interface WebviewPostMessage {
  command: WebviewCommand;
  message: string;
}

export interface SetSchemaCommandPayload {
  type: string;
  payload: JSONTableSchema;
  message?: string;
  key: string;
}
