import { HttpResponseCode } from "./http_response_code";

export interface InternalErrorInfo {
  code?: number;
  message?: string;
}

export class InternalError<T extends InternalErrorInfo> extends Error {
  protected _code: number;

  constructor(infor?: T) {
    super(infor?.message);
    this._code = infor?.code ?? HttpResponseCode.INTERNAL_SERVER_ERROR;

    Object.setPrototypeOf(this, InternalError.prototype);
  }

  get code(): number {
    return this._code;
  }

  set code(value: number) {
    this._code = value;
  }
}
