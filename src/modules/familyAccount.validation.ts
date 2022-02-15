import individualAccountService from '../services/individualAccount.service.js';
import familyAccountService from '../services/familyAccount.service.js';
import { IGeneralObj } from '../types/general.types.js';
import { IIndividualAccount, IndividualTransferDetails, DetailsLevel, AccountStatuses, AccountTypes, IFamilyAccount } from '../types/account.types.js';
import validator from '../utils/validator.js';
import accountValidationUtils from '../utils/account.validator.js';
import individualAccountValidator from './individualAccount.validation.js';
import ValidationDetails from '../types/validation.types.js';
import InvalidArgumentsError from '../exceptions/InvalidArguments.exception.js';
import validationCheck from '../utils/validation.utils.js';
import accountValidator from './account.valdation.js';
import familyAccountRepository from '../repositories/familyAccount.repository.js';
import businessAccountService from '../services/businessAccount.service.js';
class FamilyAccountValidator {
  private readonly min_amount_of_balance = 5000;

  async creation(payload: IGeneralObj) {
    const familyRequiredFields = ['currency', 'individual_accounts_details', 'agent_id'];
    const validation_queue: ValidationDetails[] = [];

    validation_queue.push([validator.checkRequiredFieldsExist(payload, familyRequiredFields), new InvalidArgumentsError('Some of the required values are not inserted')]);
    validation_queue.push([validator.checkFieldsNotExist(payload, ['account_id']), new InvalidArgumentsError('account_id should not be inserted')]);
    validation_queue.push([Array.isArray(payload.individual_accounts_details), new InvalidArgumentsError('individual_accounts_details must be an array of tupples')]);

    validationCheck(validation_queue);

    const individual_accounts_details: IndividualTransferDetails[] = payload.individual_accounts_details;
    const individual_accounts_ids = individual_accounts_details.map(account_details => account_details[0]);
    const individual_accounts: IIndividualAccount[] = await individualAccountService.getIndividualAccountsByAccountIds(individual_accounts_ids);
    const individual_accounts_balance_after_transfer: IGeneralObj = individualAccountService.getIndividualAccountsRemainingBalance(individual_accounts, individual_accounts_details);

    validation_queue.push([payload.individual_accounts_details.length !== 0, new InvalidArgumentsError('individual_accounts_details must have at lease one tupple')]);
    validation_queue.push([accountValidationUtils.isValidArrayOfTransfer(payload.individual_accounts_details), new InvalidArgumentsError(`Invalid details of individual accounts`)]);
    validation_queue.push([individual_accounts.length === individual_accounts_ids.length, new InvalidArgumentsError(`Some of the individual accounts are not exist`)]);
    validation_queue.push([
      accountValidationUtils.isAllAccountsWithSameStatus(individual_accounts, AccountStatuses.active),
      new InvalidArgumentsError(`Some of the individual accounts are not active`),
    ]);
    validation_queue.push([accountValidationUtils.isAllWithSameCurrency(String(payload.currency), individual_accounts), new InvalidArgumentsError(`Some of the accounts have different currencies`)]);
    validation_queue.push([
      validator.isSumAboveMinAmount(
        this.min_amount_of_balance,
        individual_accounts_details.map(individual_account => individual_account[1]),
      ),
      new InvalidArgumentsError(`the sum of the amounts didn't pass the minimum of ${this.min_amount_of_balance}`),
    ]);
    validation_queue.push([
      validator.isEachAboveMinAmount(individualAccountValidator.minAmountOfBalance, Object.values(individual_accounts_balance_after_transfer) as number[]),
      new InvalidArgumentsError(`There is an individual account that will have less than ${individualAccountValidator.minAmountOfBalance} coins after the transaction`),
    ]);

    validationCheck(validation_queue);
  }

  async addIndividualAccounts(payload: IGeneralObj) {
    const validation_queue: ValidationDetails[] = [];
    validation_queue.push([
      validator.checkRequiredFieldsExist(payload, ['account_id', 'details_level', 'individual_accounts_details']),
      new InvalidArgumentsError('some of the required fields are not inserted'),
    ]);

    validation_queue.push([accountValidationUtils.isDetailsLevelValid(payload.details_level as string), new InvalidArgumentsError('details_level is not valid')]);

    validation_queue.push([accountValidationUtils.isValidId(payload.account_id as string), new InvalidArgumentsError('account_id must be numeric')]);

    validation_queue.push([Array.isArray(payload.individual_accounts_details), new InvalidArgumentsError('individual_accounts_details list must be an array')]);

    validationCheck(validation_queue);

    validation_queue.push([!validator.isEmptyArray(payload.individual_accounts_details as any[]), new InvalidArgumentsError('individual_accounts_details list should not be empty')]);

    const individual_accounts_ids = (payload.individual_accounts_details as string[]).map(individual_id_amount_tuple => individual_id_amount_tuple[0]);
    const individual_accounts_amounts = (payload.individual_accounts_details as string[]).map(individual_id_amount_tuple => Number(individual_id_amount_tuple[1]));

    validation_queue.push([validator.isAllNumbersPositive(individual_accounts_amounts), new InvalidArgumentsError(`Some of the inserted amounts are not positive`)]);
    validation_queue.push([accountValidationUtils.isValidIds(individual_accounts_ids), new InvalidArgumentsError('there is an individual account_id that is not numeric')]);

    validationCheck(validation_queue);

    const individual_accounts: IIndividualAccount[] = await individualAccountService.getIndividualAccountsByAccountIds(individual_accounts_ids);
    const family_account = await familyAccountService.getFamilyAccountById(payload.account_id as string, DetailsLevel.full);

    validation_queue.push([
      accountValidationUtils.isAllWithSameCurrency(family_account.currency, individual_accounts),
      new InvalidArgumentsError(`some of the accounts don't have the same currency as the currency in the family account`),
    ]);

    validation_queue.push([
      accountValidationUtils.isAllAccountsWithSameStatus(individual_accounts, AccountStatuses.active),
      new InvalidArgumentsError(`some of the individual accounts are not active`),
    ]);

    validationCheck(validation_queue);
  }

  async removeIndividualAccount(payload: IGeneralObj) {
    const validation_queue: ValidationDetails[] = [];
    validation_queue.push([
      validator.checkRequiredFieldsExist(payload, ['account_id', 'details_level', 'individual_accounts_details']),
      new InvalidArgumentsError('some of the required fields are not inserted'),
    ]);

    validation_queue.push([accountValidationUtils.isDetailsLevelValid(payload.details_level as string), new InvalidArgumentsError('details_level is not valid')]);

    validation_queue.push([accountValidationUtils.isValidId(payload.account_id as string), new InvalidArgumentsError('account_id must be numeric')]);

    validation_queue.push([Array.isArray(payload.individual_accounts_details), new InvalidArgumentsError('individual_accounts_details list must be an array')]);

    validationCheck(validation_queue);

    validation_queue.push([!validator.isEmptyArray(payload.individual_accounts_details as any[]), new InvalidArgumentsError('individual_accounts_details list should not be empty')]);

    const individual_accounts_ids = (payload.individual_accounts_details as string[]).map(individual_id_amount_tuple => individual_id_amount_tuple[0]);
    const individual_accounts_amounts = (payload.individual_accounts_details as string[]).map(individual_id_amount_tuple => Number(individual_id_amount_tuple[1]));

    validationCheck(validation_queue);

    validation_queue.push([validator.isAllNumbersPositive(individual_accounts_amounts), new InvalidArgumentsError(`Some of the inserted amounts are not positive`)]);

    validation_queue.push([accountValidationUtils.isValidIds(individual_accounts_ids), new InvalidArgumentsError('there is an individual account_id that is not numeric')]);

    validationCheck(validation_queue);

    await individualAccountService.getIndividualAccountsByAccountIds(individual_accounts_ids);
    await familyAccountService.getFamilyAccountById(payload.account_id as string, DetailsLevel.full);

    const connected_individuals_to_family = (await familyAccountRepository.getOwnersByFamilyAccountId(payload.account_id)).map(id => String(id));

    validation_queue.push([
      individual_accounts_ids.every(individual_id => connected_individuals_to_family.includes(individual_id)),
      new InvalidArgumentsError('there is an individual account id that is not connected to family id'),
    ]);

    validationCheck(validation_queue);
  }

  async closeAccount(payload: IGeneralObj) {
    const validation_queue: ValidationDetails[] = [];

    validation_queue.push([accountValidationUtils.isValidId(String(payload.account_id)), new InvalidArgumentsError(`account id must be inserted with numeric characters.`)]);
    validationCheck(validation_queue);

    (await familyAccountRepository.getFamilyAccountsByAccountIds([payload.account_id], DetailsLevel.full)) as IFamilyAccount[];
  }

  async transferToBusiness(payload: IGeneralObj) {
    await accountValidator.transfer(payload);

    const validation_queue: ValidationDetails[] = [];
    const [source_account] = (await familyAccountRepository.getFamilyAccountsByAccountIds([payload.source_account_id], DetailsLevel.full)) as IFamilyAccount[];
    const individual_accounts_ids = await familyAccountRepository.getOwnersByFamilyAccountId(payload.source_account_id);
    const individual_accounts = await individualAccountService.getIndividualAccountsByAccountIds(individual_accounts_ids);
    await businessAccountService.getBusinessAccount(payload.destination_account_id);

    validation_queue.push([
      accountValidationUtils.isBalanceAllowsTransfer(source_account, Number(payload.amount), AccountTypes.Family),
      new InvalidArgumentsError(`balance after transaction will be below the minimal remiaining balance of family account`),
    ]);

    validation_queue.push([
      accountValidationUtils.isAllAccountsWithSameStatus(individual_accounts, AccountStatuses.active),
      new InvalidArgumentsError(`some of the individual accounts are not active`),
    ]);

    validationCheck(validation_queue);
  }

  async transferToIndividual(payload: IGeneralObj) {
    await accountValidator.transfer(payload);

    const validation_queue: ValidationDetails[] = [];
    const [source_account] = await individualAccountService.getIndividualAccountsByAccountIds([payload.source_account_id]);
    const destination_account = await familyAccountService.getFamilyAccountById(payload.destination_account_id);

    validation_queue.push([
      accountValidationUtils.isBalanceAllowsTransfer(source_account, Number(payload.amount), AccountTypes.Individual),
      new InvalidArgumentsError(`balance after transaction will be below the minimal remiaining balance of individual account`),
    ]);

    validation_queue.push([
      accountValidationUtils.isAllAccountsWithSameStatus([source_account, destination_account], AccountStatuses.active),
      new InvalidArgumentsError(`all of the accounts must be active`),
    ]);

    validationCheck(validation_queue);
  }

  get(payload: IGeneralObj) {
    const validation_queue: ValidationDetails[] = [];
    const details_level: string[] = Object.values(DetailsLevel) as string[];
    const input_details_level: string = payload.details_level;

    validation_queue.push([details_level.includes(input_details_level), new InvalidArgumentsError(`Details level is incorrect`)]);

    validationCheck(validation_queue);
  }

  get minAmountOfBalance() {
    return this.min_amount_of_balance;
  }
}

const familyAccountValidator = new FamilyAccountValidator();
export default familyAccountValidator;
