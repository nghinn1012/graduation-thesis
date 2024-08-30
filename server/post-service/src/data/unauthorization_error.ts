import { HttpResponseCode } from "./http_response_code";
import { InternalError, InternalErrorInfo } from "./internal_error";

export interface UnauthorizationErrorInfo extends InternalErrorInfo { }

export class UnauthorizationError extends InternalError<UnauthorizationErrorInfo> {
  constructor(info?: UnauthorizationErrorInfo) {
    super(info);
    this.code = info?.code ?? HttpResponseCode.UNAUTHORIZATION_ERROR;
  }
}
