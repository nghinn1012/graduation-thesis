export interface ResponseErrorLike<Target, Reason> {
  code: number;
  message: string;
  data?: {
    target: Target;
    reason: Reason;
  }
}
