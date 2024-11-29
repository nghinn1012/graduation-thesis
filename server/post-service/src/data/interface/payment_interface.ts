export interface PaymentParams {
  orderId: string;
  amount: string;
  redirectUrl: string;
}

export interface SignatureParams {
  accessKey: string;
  amount: string;
  orderId: string;
  redirectUrl: string;
  requestId: string;
  requestType: string;
  ipnUrl: string;
  orderInfo: string;
  partnerCode: string;
}

export interface RequestParams {
  accessKey: string;
  amount: string;
  orderId: string;
  redirectUrl: string;
  requestId?: string;
  requestType: string;
  ipnUrl: string;
  orderInfo: string;
  partnerCode: string;
  signature: string;
  lang: string;
}

export interface MomoPaymentConfig {
  accessKey: string;
  secretKey: string;
  partnerCode: string;
  ipnUrl: string;
  requestType: string;
  orderInfo: string;
  lang: string;
}

export interface MomoPaymentResponse {
  payUrl: string;
  signature: string;
  requestId: string;
  message: string;
  resultCode: number;
}
