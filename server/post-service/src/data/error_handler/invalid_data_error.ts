import { HttpResponseCode } from "./http_response_code";
import { InternalError, InternalErrorInfo } from "./internal_error";

export interface InvalidDataErrorInfo extends InternalErrorInfo { }

export class InvalidDataError extends InternalError<InvalidDataErrorInfo> {
  constructor(info?: InvalidDataErrorInfo) {
    super(info);
    this.code = info?.code ?? HttpResponseCode.BAD_REQUEST;
  }
}
