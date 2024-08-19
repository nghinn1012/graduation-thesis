import { HttpResponseCode } from "./http_response_code";
import { InternalError, InternalErrorInfo } from "./internal_error";

export interface InvalidDataErrorInfor extends InternalErrorInfo { }

export class InvalidDataError extends InternalError<InvalidDataErrorInfor> {
  constructor(info?: InvalidDataErrorInfor) {
    super(info);
    this.code = info?.code ?? HttpResponseCode.BAD_REQUEST;
  }
}
