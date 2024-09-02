export interface ResponseLike<DataLike, ErrorLike> {
  data?: DataLike;
  error?: ErrorLike;
}
