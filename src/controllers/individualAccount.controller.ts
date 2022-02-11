import { RequestHandler } from "express";
import { ResponseMessage } from '../types/messages.types.js';
import IndividualAccountService from "../services/individualAccount.service.js";
import { IIndividualAccount, ITransferRequest } from "../types/account.types.js";

export class IndividualController {
    static createIndividualAccount: RequestHandler = async (req,res) => {
        const individual_account = await IndividualAccountService.createIndividualAccount(req.body as IIndividualAccount);
        const response: ResponseMessage = {
          status: 200,
          message: 'success',
          data: { individual_account }
        };
        res.status(response.status).json(response);
    };

    static getIndividualAccount: RequestHandler = async (req, res) => {
      const { account_id } = req.params;
      const business_account = await IndividualAccountService.getIndividualAccountByAccountId(account_id);
      const response: ResponseMessage = {
      status: 200,
      message: 'success',
      data: { business_account }
    };
    res.status(response.status).json(response);
    };

    static transferIndividualToFamily: RequestHandler = async (req, res) => {
      const transaction = await IndividualAccountService.transferIndividualToFamily(req.body as ITransferRequest);
      const response: ResponseMessage = {
      status: 200,
      message: 'success',
      data: { transaction }
    };
    res.status(response.status).json(transaction);
    };
 }
const businessController = new IndividualController();
export default businessController;