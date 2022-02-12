import { IGeneralObj } from '../types/general.types.js';
import validator from '../utils/validator.js';
import accountValidationUtils from '../utils/account.validator.js';
import validationCheck from '../utils/validation.utils.js';
import ValidationDetails from '../types/validation.types.js';
import InvalidArgumentsError from '../exceptions/InvalidArguments.exception.js';
import individualAccountValidator from './individualAccount.validation.js';
import accountValidator from './account.valdation';
class BusinessAccountValidator {
  private readonly company_id_length = 8;
  private readonly min_amount_of_balance = 10000;

  creation(payload: IGeneralObj) {
    const businessRequiredFields = ['company_id', 'company_name', 'currency'];
    const validation_queue: ValidationDetails[] = [];

    validation_queue.push([
      validator.checkRequiredFieldsExist(payload, businessRequiredFields),
      new InvalidArgumentsError('Some of the required values are not inserted'),
    ]);

    validation_queue.push([
      validator.checkFieldsNotExist(payload, ['account_id']),
      new InvalidArgumentsError('account_id should not be inserted'),
    ]);

    validation_queue.push([
      accountValidationUtils.isValidId(String(payload.company_id), this.company_id_length),
      new InvalidArgumentsError(
        `id must be made of ${this.company_id_length} numbers`,
      ),
    ]);

    validationCheck(validation_queue);
  }

  async transferToBusiness(payload: IGeneralObj) {
    //await accountValidator.transfer(payload);
  }

  async transferToIndividual(payload: IGeneralObj) {
    //await accountValidator.transfer(payload);
  }

  get minAmountOfBalance() {
    return this.min_amount_of_balance;
  }
}

const businessAccountValidator = new BusinessAccountValidator();
export default businessAccountValidator;
