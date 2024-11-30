import crypto from 'crypto';
import { RequestParams, SignatureParams } from '../data/interface/payment_interface';

export const buildSignature = (params: SignatureParams) => {
  const fields = [
    `accessKey=${params.accessKey}`,
    `amount=${params.amount}`,
    `extraData=`,
    `ipnUrl=${params.ipnUrl}`,
    `orderId=${params.orderId}`,
    `orderInfo=${params.orderInfo}`,
    `partnerCode=${params.partnerCode}`,
    `redirectUrl=${params.redirectUrl}`,
    `requestId=${params.orderId}`,
    `requestType=${params.requestType}`
  ];

  return fields.join('&');
};

export const createSignature = (rawSignature: string, secretKey: string) => {
  return crypto.createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');
};

export const buildRequestBody = (params: RequestParams) => {
  return JSON.stringify({
    partnerCode: params.partnerCode,
    partnerName: 'Test',
    storeId: 'MomoTestStore',
    requestId: params.requestId,
    amount: params.amount,
    orderId: params.orderId,
    orderInfo: params.orderInfo,
    redirectUrl: params.redirectUrl,
    ipnUrl: params.ipnUrl,
    lang: params.lang,
    requestType: params.requestType,
    autoCapture: true,
    extraData: '',
    orderGroupId: '',
    signature: params.signature
  });
};

export const parseMomoResponse = (queryString: string) => {
  const urlObj = new URL(queryString);

  const result = {
      partnerCode: urlObj.searchParams.get('partnerCode'),
      orderId: urlObj.searchParams.get('orderId'),
      requestId: urlObj.searchParams.get('requestId'),
      amount: parseInt(urlObj.searchParams.get('amount') || '0'),
      orderInfo: decodeURIComponent(urlObj.searchParams.get('orderInfo') || ''),
      orderType: urlObj.searchParams.get('orderType'),
      transId: urlObj.searchParams.get('transId'),
      resultCode: parseInt(urlObj.searchParams.get('resultCode') || '0'),
      message: decodeURIComponent(urlObj.searchParams.get('message') || ''),
      payType: urlObj.searchParams.get('payType'),
      responseTime: parseInt(urlObj.searchParams.get('responseTime') || '0'),
      extraData: urlObj.searchParams.get('extraData'),
      signature: urlObj.searchParams.get('signature')
  };

  return result;
};
