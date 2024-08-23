import { HttpResponseCode } from "./http_response_code.data";
import { InternalError, InternalErrorInfo } from "./internal_error.data";

export interface InvalidDataErrorInfor extends InternalErrorInfo { }

export class InvalidDataError extends InternalError<InvalidDataErrorInfor> {
  constructor(info?: InvalidDataErrorInfor) {
    super(info);
    this.code = info?.code ?? HttpResponseCode.BAD_REQUEST;
  }
}
