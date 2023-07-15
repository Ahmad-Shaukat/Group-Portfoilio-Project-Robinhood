import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { groupBy } from '../Portfolio'
import {
  createTransactionThunk,
  getAllTransactionsThunk,
} from '../../store/transactions';

import { updateAccountInfo, getAccountInfo } from '../../store/account';
import { getStockCurrent } from '../../store/stocks';
import OpenModalButton from '../OpenModalButton';
import { useModal } from '../../context/Modal';
import './Transaction.css';

export default function Transactions() {
  const dispatch = useDispatch();
  let transactions = useSelector((state) => state?.transactions);
  let trans = Object.values(transactions)
  let transInv = groupBy(trans, ['symbol', 'transaction'])
  let transKeys = Object.keys(transInv)
  useEffect(() => {
    dispatch(getAllTransactionsThunk());
  }, []);

  return (
    <div className="stock-inventory">
      <ul>
        {transKeys.map(ele => {
          let total = 0
          transInv[ele].buy?.forEach(e => total += e.quantity)
          transInv[ele].sell?.forEach(e => total -= e.quantity)
          return(
            <li key={ele}>
              {`${ele} : ${total}`}
            </li>
          )
        })}
      </ul>
    </div>

  );
}
export function NewTransaction() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [transaction, setTransaction] = useState('');
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [symbol, setSymbol] = useState('');
  const [fin, setFin] = useState({ transaction, quantity, symbol, price });
  const [disabled, setDisabled] = useState(true);
  const [priceErr, setPriceErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const userId = useSelector((state) => state.session.user.id);

  const [stockOwned, setStockOwned] = useState(0);
  let balance = useSelector((state) => state?.account?.info?.balance);
  const ownedStocks = useSelector((state) => Object.values(state.transactions));

  useEffect(() => {
    dispatch(getAllTransactionsThunk());
    dispatch(getAccountInfo());
  }, []);

  useEffect(() => {
    let totalStockOwned = 0;

    ownedStocks.forEach((stock) => {
      if (stock.symbol === symbol) {
        if (stock.transaction === 'buy') {
          totalStockOwned += stock.quantity;
        } else if (stock.transaction === 'sell') {
          totalStockOwned -= stock.quantity;
        }
      }
    });

    setStockOwned(totalStockOwned);
  }, [ownedStocks, symbol]);

  useEffect(() => {
    setFin({ transaction, quantity, symbol, price });
    if (transaction == 'buy') {
      setPriceErr(quantity * price >= balance);
      setErrMsg('the cost of this transaction exceeds your balance');
    } else if (transaction == 'sell') {
      setPriceErr(quantity > stockOwned);
      setErrMsg('You do not own that many stocks of this type');
    }
  }, [transaction, quantity, symbol, price]);

  useEffect(async () => {
    let value = await dispatch(getStockCurrent(symbol));
    if (symbol && value) {
      setPrice(value.price);
      setDisabled(false);
    } else {
      setPrice('No such stock');
      setDisabled(true);
    }
  }, [symbol]);
  const submit = async (e) => {
    e.preventDefault();

    if (transaction && quantity >= 1 && symbol && price) {
      const transactionAmount = quantity * price;
      const newBalance = balance - transactionAmount;
      const balancePayload = {
        balance: newBalance,
      };
      if (transaction == 'buy') {
        if (quantity * price <= balance) {
          await dispatch(createTransactionThunk(fin));
          const newBalance = balance - transactionAmount;
          const balancePayload = {
            balance: newBalance,
          };
          dispatch(updateAccountInfo(userId, balancePayload));
        }
      } else if (transaction == 'sell') {
        if (stockOwned >= quantity) {
          await dispatch(createTransactionThunk(fin));
          const newBalance = balance + transactionAmount;
          const balancePayload = {
            balance: newBalance,
          };
          dispatch(updateAccountInfo(userId, balancePayload));
        }
      }
    }
  };
  return (
    <div className="transaction-box">
      <form onSubmit={submit} method="POST" action={'/api/transactions/new'}>
        <div>
          <label>
            <select
              name="transaction"
              onChange={(e) => setTransaction(e.target.value)}
              value={transaction}
            >
              <option key={'NA'} value={''}>
                Pick an Option
              </option>
              <option key={'Buy'} value={'buy'}>
                Buy
              </option>
              <option key={'Sell'} value={'sell'}>
                Sell
              </option>
            </select>
          </label>
          <div>
            <label>
              Quantity
              <input
                placeholder="1"
                type="number"
                name="quantity"
                onChange={(e) => setQuantity(e.target.value)}
                value={quantity}
              />
            </label>
          </div>
          <div>
            <label>
              Symbol
              <input
                type="text"
                name="symbol"
                onChange={(e) => setSymbol(e.target.value)}
                value={symbol}
              />
            </label>
          </div>
          <div>Price: {price}</div>
          <div>
            {priceErr ? (
              <OpenModalButton
                buttonText="Submit"
                modalComponent={<PriceErrorModal err={errMsg} />}
              />
            ) : (
              <button
                type="submit"
                disabled={disabled}
                className="open-modal-button-master"
              >
                submit
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
export const PriceErrorModal = (props) => {
  const { closeModal } = useModal();
  const { err } = props;
  const history = useHistory();
  return (
    <div className="deletemain">
      <h3>{err}</h3>
      <div className="deletemain-buttons">
        <button id="nobutton" onClick={() => closeModal()}>
          OK
        </button>
      </div>
    </div>
  );
};
