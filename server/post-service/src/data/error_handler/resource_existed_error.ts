import { HttpResponseCode } from "./http_response_code";
import { InternalError, InternalErrorInfo } from "./internal_error";

export interface ResourceExistedErrorInfo extends InternalErrorInfo { }

export class ResourceExistedError extends InternalError<ResourceExistedErrorInfo> {
  constructor(info?: ResourceExistedErrorInfo) {
    super(info);
    this.code = info?.code ?? HttpResponseCode.RESOURCE_EXISTED;
  }
}
