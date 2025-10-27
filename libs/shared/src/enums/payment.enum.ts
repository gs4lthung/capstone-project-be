export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
}

export enum WalletTransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum WithdrawalRequestStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
