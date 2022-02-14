import { AccountStatuses, AccountTypes, DetailsLevel, IFamilyAccount, IFamilyAccountCreationInput, IndividualTransferDetails, ITransferRequest, ITransferResponse } from '../types/account.types.js';
import familyAccountRepository from '../repositories/familyAccount.repository.js';
import transferRepository from '../repositories/transfer.repository.js';
import TransferError from '../exceptions/transfer.exception.js';
import LogicError from '../exceptions/logic.exception.js';
import accountRepository from '../repositories/account.repository.js';
import accountValidationUtils from '../utils/account.validator.js';
import familyAccountValidator from '../modules/familyAccount.validation.js';

export class FamilyAccountService {
  private readonly transaction_limit_business_to_individual = 5000;

  async createFamilyAccount(payload: Omit<IFamilyAccountCreationInput, 'account_id'>): Promise<IFamilyAccount> {
    const family_account_id = await familyAccountRepository.createFamilyAccount(payload);
    const family_account = await this.addIndividualAccountsToFamilyAccount(family_account_id, payload.individual_accounts_details, DetailsLevel.full);

    return family_account;
  }

  async getFamilyAccountById(family_account_id: string, details_level?: DetailsLevel): Promise<IFamilyAccount> {
    details_level = details_level || DetailsLevel.short;
    const [family_account] = (await familyAccountRepository.getFamilyAccountsByAccountIds([family_account_id], details_level)) as IFamilyAccount[];

    return family_account;
  }

  async transferFamilyToBusiness(payload: ITransferRequest): Promise<ITransferResponse> {
    if (payload.amount > this.transaction_limit_business_to_individual) {
      throw new TransferError(`transaction from family account to business account is limited to ${this.transaction_limit_business_to_individual} coins`);
    }
    const transaction = (await transferRepository.transfer(payload, 1)) as ITransferResponse;

    return transaction;
  }

  async addIndividualAccountsToFamilyAccount(family_account_id: string, individual_accounts_details: IndividualTransferDetails[], details_level?: DetailsLevel) {
    const individual_accounts_id = individual_accounts_details.map((individual_accounts: IndividualTransferDetails) => individual_accounts[0]);

    await familyAccountRepository.addIndividualAccountsToFamilyAccount(family_account_id, individual_accounts_id);
    await familyAccountRepository.transferFromIndividualAccountsToFamilyAccount(family_account_id, individual_accounts_details);

    const family_account: IFamilyAccount = await this.getFamilyAccountById(family_account_id, details_level);

    return family_account;
  }

  async removeIndividualAccountsFromFamilyAccount(family_account_id: string, individual_accounts_details: IndividualTransferDetails[], details_level?: DetailsLevel) {
    const amount_to_remove = individual_accounts_details.reduce((amount: number, individual_accounts: IndividualTransferDetails) => amount + Number(individual_accounts[1]), 0);
    const [account] = await accountRepository.getAccountsByAccountIds([family_account_id]);
    const owners_id = await familyAccountRepository.getOwnersByFamilyAccountId(family_account_id);
    const individual_accounts_id = individual_accounts_details.map((individual_accounts: IndividualTransferDetails) => individual_accounts[0]);
    const remove_all = owners_id.length === individual_accounts_details.length;

    if (!accountValidationUtils.isBalanceAllowsTransfer(account, amount_to_remove, AccountTypes.Family) && !remove_all) {
      throw new TransferError(`family account with connected individual accounts must remain with at least ${familyAccountValidator.minAmountOfBalance} coins`);
    } else if (amount_to_remove > account.balance) {
      throw new TransferError(`family account can't remain with negative amount of coins`);
    }

    await familyAccountRepository.removeIndividualAccountsFromFamilyAccount(family_account_id, individual_accounts_id);
    await familyAccountRepository.transferFromFamilyAccountToIndividualAccounts(family_account_id, individual_accounts_details);

    const family_account: IFamilyAccount = await this.getFamilyAccountById(family_account_id, details_level);

    return family_account;
  }

  async closeFamilyAccount(account_id: string) {
    const owners_id = await familyAccountRepository.getOwnersByFamilyAccountId(account_id);

    if (owners_id.length !== 0) {
      throw new LogicError(`family account can't be closed with individual accounts connected to it`);
    }
    await accountRepository.changeAccountsStatusesByAccountIds([account_id], AccountStatuses.inactive);

    return ((await familyAccountRepository.getFamilyAccountsByAccountIds([account_id], DetailsLevel.full)) as IFamilyAccount[])[0];
  }
}

const familyAccountService = new FamilyAccountService();
export default familyAccountService;
