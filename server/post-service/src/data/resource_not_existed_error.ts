import { HttpResponseCode } from "./http_response_code";
import { InternalError, InternalErrorInfo } from "./internal_error";

export interface ResourceNotExistedErrorInfo extends InternalErrorInfo { }

export class ResourceNotExistedError extends InternalError<ResourceNotExistedErrorInfo> {
  constructor(info?: ResourceNotExistedErrorInfo) {
    super(info);
    this.code = info?.code ?? HttpResponseCode.RESOURCE_NOT_EXISTED;
  }
}
