import { OkPacket } from 'mysql2';
import { sql_con } from '../db/sql/sql.connection.js';
import { ITransferRequest, ITransferResponse } from '../types/account.types.js';
import accountRepository from './account.repository.js';
import DatabaseException from '../exceptions/db.exception.js';
import { IGeneralObj } from '../types/general.types.js';

class TransferRepository {
  async transfer(payload: ITransferRequest, rate: number) {
    try {
      let source_account, destination_account;
      const [account_a, account_b] = await accountRepository.getAccountsByAccountIds([payload.source_account_id, payload.destination_account_id], true);

      source_account = payload.source_account_id === account_a.account_id ? account_a : account_b;
      destination_account = payload.destination_account_id === account_b.account_id ? account_b : account_a;

      if (source_account.balance && destination_account.balance) {
        const updated_source_account_balance = source_account.balance - payload.amount;
        const updated_destination_account_balance = destination_account.balance + payload.amount * rate;

        let query = `UPDATE account SET balance = (
                            CASE WHEN accountID = ? THEN ?
                                 WHEN accountID = ? THEN ?
                            END)
                            WHERE accountID in (?, ?)`;
        const [transfer_update] = (await sql_con.query(query, [
          payload.source_account_id,
          updated_source_account_balance,
          payload.destination_account_id,
          updated_destination_account_balance,
          payload.source_account_id,
          payload.destination_account_id,
        ])) as unknown as OkPacket[];

        source_account.balance = updated_source_account_balance;
        destination_account.balance = updated_destination_account_balance;

        const transaction_payload = {
          sourceAccountID: payload.source_account_id,
          destinationAccountID: payload.destination_account_id,
          sourceCurrencyID: (source_account as IGeneralObj).currencyID,
          destinationCurrencyID: (destination_account as IGeneralObj).currencyID,
          amount: payload.amount,
          // date: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };

        query = 'INSERT INTO transaction SET ?';
        (await sql_con.query(query, transaction_payload)) as unknown as OkPacket[];

        const transfer_response = {
          source_account: {
            account_id: source_account.account_id,
            currency: source_account.currency,
            balance: source_account.balance,
          },
          destination_account: {
            account_id: destination_account.account_id,
            currency: destination_account.currency,
            balance: destination_account.balance,
          },
        };
        return transfer_response as ITransferResponse;
      }
    } catch (err) {
      throw new DatabaseException((err as IGeneralObj).message);
    }
  }
}

const transferRepository = new TransferRepository();
export default transferRepository;
