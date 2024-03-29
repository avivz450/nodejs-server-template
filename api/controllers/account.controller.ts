import { RequestHandler } from 'express';
import accountService from '../services/account.js';
import { Account } from '../modules/account.js';
import { HttpStatusCodes } from '../types/http_status_codes.js';

export class AccountController {
  getAccounts: RequestHandler = async function (req, res) {
    const method_name = 'AccountController/getAccounts';
    logger.info(req.correlation_id, `${method_name} - start`);

    try {
      let filters = req.query;
      logger.verbose(req.correlation_id, `${method_name} - calling AccountService/getAccounts`);
      let accounts: Account[] = await accountService.getAccounts(req.correlation_id, filters);
      logger.verbose(req.correlation_id, `${method_name} - calling Account/parseObjectToResponse `);
      let result = Account.parseListToResponse(req.correlation_id, accounts);
      logger.obj(result, `${req.correlation_id} ${method_name} - result: `);
      logger.info(req.correlation_id, `${method_name} - end`);
      return res.done(result);
    } catch (err: any) {
      logger.err(req.correlation_id, `${method_name} - error: `, err);
      err.message = err.message ? err.message : 'ERROR_GET_ACCOUNTS';
      return res.error(err);
    }
  };

  createAccount: RequestHandler = async function (req: any, res: any) {
    const method_name = 'AccountController/createAccount';
    logger.info(req.correlation_id, `${method_name} - start`);

    try {
      logger.verbose(req.correlation_id, `${method_name} - calling Account/parseFromRequest`);
      let account: Account = Account.parseObjectFromRequest(req.correlation_id, req);
      logger.verbose(req.correlation_id, `${method_name} - calling AccountService/createAccount`);
      let account_creation_result: Account = await accountService.createAccount(req.correlation_id, account);
      logger.verbose(req.correlation_id, `${method_name} - calling Account/parseObjectToResponse`);
      let result = Account.parseObjectToResponse(req.correlation_id, account_creation_result);
      logger.obj(result, `${req.correlation_id} ${method_name} - result: `);
      logger.info(req.correlation_id, `${method_name} - end`);
      return res.done(result, HttpStatusCodes.CREATED);
    } catch (err: any) {
      logger.err(req.correlation_id, `${method_name} - error: `, err);
      err.message = err.message ? err.message : 'ERROR_CREATE_ACCOUNT';
      return res.error(err);
    }
  };

  getAccount: RequestHandler = async function (req, res) {
    const method_name = 'AccountController/getAccount';
    logger.info(req.correlation_id, `${method_name} - start`);

    try {
      let account_id = req.params['account_id'] || '';
      logger.verbose(req.correlation_id, `${method_name} - calling AccountService/getAccount`);
      let account: Account = await accountService.getAccount(req.correlation_id, account_id);
      logger.verbose(req.correlation_id, `${method_name} - calling Account/parseObjectToResponse`);
      let result = Account.parseObjectToResponse(req.correlation_id, account);
      logger.obj(result, `${req.correlation_id} ${method_name} - result: `);
      logger.info(req.correlation_id, `${method_name} - end`);
      return res.done(result);
    } catch (err: any) {
      logger.err(req.correlation_id, `${method_name} - error: `, err);
      err.message = err.message ? err.message : 'ERROR_GET_ACCOUNT';
      return res.error(err);
    }
  };

  updateAccount: RequestHandler = async function (req, res) {
    const method_name = 'AccountController/updateAccount';
    logger.info(req.correlation_id, `${method_name} - start`);

    try {
      logger.verbose(req.correlation_id, `${method_name} - calling Account/parseFromRequest`);
      let account: Account = Account.parseObjectFromRequest(req.correlation_id, req);
      logger.verbose(req.correlation_id, `${method_name} - calling AccountService/updateAccount`);
      let account_creation_result: Account = await accountService.updateAccount(req.correlation_id, account);
      logger.verbose(req.correlation_id, `${method_name} - calling Account/parseObjectToResponse`);
      let result = Account.parseObjectToResponse(req.correlation_id, account_creation_result);
      logger.obj(result, `${req.correlation_id} ${method_name} - result: `);
      logger.info(req.correlation_id, `${method_name} - end`);
      return res.done(result);
    } catch (err: any) {
      logger.err(req.correlation_id, `${method_name} - error: `, err);
      err.message = err.message ? err.message : 'ERROR_UPDATE_ACCOUNT';
      return res.error(err);
    }
  };

  deleteAccount: RequestHandler = async function (req, res) {
    const method_name = 'AccountController/deleteAccount';
    logger.info(req.correlation_id, `${method_name} - start`);

    try {
      let account_id = req.params['account_id'] || '';
      logger.verbose(req.correlation_id, `${method_name} - calling AccountService/deleteAccount`);
      let deleted_account: Account = await accountService.deleteAccount(req.correlation_id, account_id);
      logger.verbose(req.correlation_id, `${method_name} - calling Account/parseObjectToResponse`);
      let result = Account.parseDeletedObjectToResponse(req.correlation_id, deleted_account);
      logger.obj(result, `${req.correlation_id} ${method_name} - result: `);
      logger.info(req.correlation_id, `${method_name} - end`);
      return res.done(result);
    } catch (err: any) {
      logger.err(req.correlation_id, `${method_name} - error: `, err);
      err.message = err.message ? err.message : 'ERROR_DELETE_ACCOUNT';
      return res.error(err);
    }
  };
}

const account_controller = new AccountController();
export default account_controller;
