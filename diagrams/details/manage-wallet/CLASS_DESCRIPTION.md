# Feature: Manage Wallet

## Controllers

| Class | No | Method | Description |
|-------|----|--------------------|-------------|

### WalletController

| No | Method | Description |
|----|--------|-------------|
| 1 | findAll(pagination, sort, filter) | Get all wallets for authenticated user with pagination, sorting, filtering |
| 2 | findBanks() | Get list of all available banks |
| 3 | findByUserId() | Get wallet by current user ID with relations |
| 4 | findOne(id) | Get specific wallet by ID with relations |
| 5 | create(CreateWalletDto) | Create new wallet for authenticated user |
| 6 | update(id, UpdateWalletDto) | Update existing wallet for authenticated user |
| 7 | requestWithdrawal(amount) | Request withdrawal from user's wallet |

## Services

### WalletService

| No | Method | Description |
|----|--------|-------------|
| 1 | findAll(findOptions) | Query all wallets with pagination, sorting, filtering |
| 2 | findOne(id) | Find wallet by ID with relations (user, bank, transactions) |
| 3 | findBanks() | Query all banks from database |
| 4 | findByUserId() | Find wallet by current user ID with relations (bank, transactions, withdrawalRequests) |
| 5 | create(CreateWalletDto) | Transaction: create wallet with bank and account number |
| 6 | update(id, UpdateWalletDto) | Transaction: update wallet bank information |
| 7 | handleWithdrawalRequest(amount) | Transaction: process withdrawal, deduct balance, create DEBIT transaction |
| 8 | handleWalletTopUp(userId, amount) | Transaction: add funds to wallet, create CREDIT transaction, update income |

## Guards

### AuthGuard
Validates JWT token from request headers for all wallet operations except findBanks.

## DTOs

### CreateWalletDto
Properties: bankId (number), bankAccountNumber (string)

### UpdateWalletDto
Properties: bankId (number, optional), bankAccountNumber (string, optional)

## Entities

### Wallet
User's wallet for managing balance. Properties: id, bankAccountNumber, currentBalance (default 0), totalIncome (default 0), user (OneToOne User), bank (ManyToOne Bank), transactions (OneToMany WalletTransaction), withdrawalRequests (OneToMany WithdrawalRequest), createdAt, updatedAt.

### WalletTransaction
Records all wallet transactions. Properties: id, amount, description, type (CREDIT/DEBIT enum), wallet (ManyToOne Wallet), session (ManyToOne Session), withdrawalRequest (ManyToOne WithdrawalRequest), createdAt.

### Bank
Available banks for linking. Properties: id, name, bin (bank identification number), wallets (OneToMany Wallet).

### User
User who owns wallet. Properties: id, fullName, email, wallet (OneToOne Wallet).

### WithdrawalRequest
Withdrawal request records. Properties: id, wallet (ManyToOne Wallet), amount, status, walletTransactions (OneToMany WalletTransaction).

## Scope Rules

- **View Access**: All authenticated users can view their own wallet data
- **Wallet Ownership**: Each user has one wallet (OneToOne relationship)
- **Bank List**: Public endpoint for viewing available banks (no auth required)
- **Create Wallet**: User can create wallet by selecting bank and providing account number
- **Update Wallet**: User can update bank information (bankId, bankAccountNumber)
- **Balance Management**: 
  - currentBalance: tracks available funds
  - totalIncome: tracks lifetime earnings (never decreases)
- **Withdrawal Process**:
  - Verify sufficient balance (amount <= currentBalance)
  - Deduct from currentBalance only (totalIncome unchanged)
  - Create DEBIT transaction record
- **Top-up Process** (Internal):
  - Add to both currentBalance and totalIncome
  - Create CREDIT transaction record
  - Called by system for earnings/payments
- **Transaction Types**:
  - CREDIT: funds added (top-up, earnings)
  - DEBIT: funds removed (withdrawal)
- **Transaction Relations**: Links to wallet, session (for earnings), withdrawalRequest
- **Validation**: Wallet must exist before operations, balance must be sufficient for withdrawals
- **Soft Delete**: Not implemented for wallets (cascade delete with user)
