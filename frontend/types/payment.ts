export interface EsewaPaymentData {
  amount: string;
  tax_amount: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: string;
  product_delivery_charge: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
}

export interface PaymentInitResponse {
  success: boolean;
  data: EsewaPaymentData;
  message?: string;
}

export interface PaymentVerifyRequest {
  transactionCode: string;
  transactionUUID: string;
  amount: string | number;
}

export interface EsewaSuccessPayload {
  transaction_code: string;
  status: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  signed_field_names: string;
  signature: string;
}

export interface Transaction {
  id: string;
  _id: string;
  status: string;
  amount: number;
  transactionUUID?: string;
  transactionCode?: string;
  buyerId?: unknown;
  sellerId?: unknown;
  productId?: unknown;
  productIds?: unknown[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  data: Transaction;
  message?: string;
}

export interface TransactionResponse {
  success: boolean;
  data: Transaction;
  message?: string;
}
