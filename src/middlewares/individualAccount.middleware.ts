import { RequestHandler } from 'express';
import { individualAccountValidator } from '../modules/individualAccount.validation.js';
import { IGeneralObj } from '../types/general.types.js';

const verifyIndividualAccountCreation: RequestHandler = async (req, res, next) => {
  await individualAccountValidator.creation(req.body as IGeneralObj);
  next();
};

export default verifyIndividualAccountCreation;