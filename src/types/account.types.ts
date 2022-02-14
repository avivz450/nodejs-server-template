export interface IAccount {
  account_id: string;
  currency: string;
  balance: number;
  status?: AccountStatuses;
  agent_id?: string;
  currencyID?: string;
}

export enum AccountTypes {
  Individual = 'Individual',
  Business = 'Business',
  Family = 'Family',
}

export interface IFamilyAccountDB {
  accountID: number;
  individualAccountID: number;
  currencyCode: string;
  balance: number;
  statusName: string;
  agentID: string;
  context?: string;
}

export enum AccountStatuses {
  active = 'active',
  inactive = 'inactive',
}

export enum TransferTypes {
  same_currency = 'transfer',
  different_currency = 'different-currency-transfer',
}
export interface IIndividualAccount extends IAccount {
  individual_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  address?: Partial<IAddress>;
}
export interface IBusinessAccount extends IAccount {
  company_id: string;
  company_name: string;
  context?: string;
  address?: Partial<IAddress>;
}

export type IndividualTransferDetails = [string, number];

export interface IFamilyAccount extends IAccount {
  context: string;
  owners: string[] | IIndividualAccount[];
}
export interface IFamilyAccountCreationInput extends Omit<IFamilyAccount, 'owners'> {
  individual_accounts_details: IndividualTransferDetails[];
}
export interface IAddress {
  address_id: string;
  country_name: string;
  country_code: string;
  postal_code: string;
  city: string;
  region: string;
  street_name: string;
  street_number: string;
}
export interface ITransferRequest {
  source_account_id: string;
  destination_account_id: string;
  amount: number;
}
export interface ITransferResponse {
  source_account: Partial<IAccount>;
  destination_account: Partial<IAccount>;
  rate?: number;
}

export enum DetailsLevel {
  full = 'full',
  short = 'short',
}

export interface IAccountDB {
  accountID: string;
  balance: number;
  currencyCode: string;
  currencyID?: string;
  statusName: string;
  agentID: string;
}
export interface IIndividualAccountDB {
  accountID: number;
  currencyCode: string;
  balance: number;
  statusName: string;
  agentID: string
  individualID: number;
  firstName: string;
  lastName: number;
  email: string;
  addressID: number;
  countryName: string;
  countryCode: string;
  postalCode: number;
  city: string;
  region: string;
  streetName: string;
  streetNumber: string;
}

export interface IBusinessAccountDB {
  accountID: number;
  currencyCode: string;
  balance: number;
  statusName: string;
  agentID: string
  companyID: number;
  companyName: string;
  context?: string;
  addressID: number;
  countryName: string;
  countryCode: string;
  postalCode: number;
  city: string;
  region: string;
  streetName: string;
  streetNumber: string;
}

export interface IFamilyAccountDB {
  accountID: number;
  individualAccountID: number;
  currencyCode: string;
  balance: number;
  statusName: string;
  agentID: string
  context?: string;
}
