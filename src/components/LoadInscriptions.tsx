import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Table, message } from 'antd';
import axios from 'axios';
import { ConnectionContext } from './ConnectionContext';

interface Inscription {
  inscriptionId: string;
  address: string;
  content: string;
}

interface TickerBalance {
  tick: string;
  availableBalance: number;
  transferableBalance: number;
}

const pageSize = 100;

async function fetchContentData(contentUrl: string): Promise<any> {
  try {
    const response = await axios.get(contentUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching content data:', error);
    return null;
  }
}

async function fetchBalanceData(address: string, ticker: string, token: string): Promise<TickerBalance> {
  try {
    const url = `https://open-api.unisat.io/v1/indexer/address/${address}/brc20/${ticker}/info`;
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = response.data.data;
    return {
      tick: ticker,
      availableBalance: data.availableBalance,
      transferableBalance: data.transferableBalance
    };
  } catch (error) {
    console.error('Error fetching balance data:', error);
    return { tick: ticker, availableBalance: 0, transferableBalance: 0 };
  }
}


const LoadInscriptions: React.FC = () => {
  const { isConnected, currentAccount, network } = useContext(ConnectionContext);
  const [tickerBalances, setTickerBalances] = useState<TickerBalance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadInscriptions = useCallback(async () => {
    if (!isConnected || !currentAccount) {
      message.info('Please connect to load inscriptions.');
      return;
    }

    setLoading(true);
    try {
      const token = 'your_api_token'; 
      const initialResponse = await window.unisat.getInscriptions(0, pageSize);
      const uniqueTickers = new Set<string>();

      for (const inscription of initialResponse.list) {
        const contentData = await fetchContentData(inscription.content);
        if (contentData && contentData.tick) {
          uniqueTickers.add(contentData.tick.toLowerCase());
        }
      }

      const balances = await Promise.all(
        Array.from(uniqueTickers).map(ticker => fetchBalanceData(currentAccount, ticker, token))
      );

      setTickerBalances(balances);
    } catch (error) {
      console.error('Failed to load inscriptions:', error);
      message.error('Failed to load inscriptions');
    } finally {
      setLoading(false);
    }
  }, [isConnected, currentAccount, network]);

  useEffect(() => {
    loadInscriptions();
  }, [loadInscriptions]);

  const balanceColumns = [
    {
      title: 'Ticker',
      dataIndex: 'tick',
      key: 'tick',
    },
    {
      title: 'Available Balance',
      dataIndex: 'availableBalance',
      key: 'availableBalance',
      render: (balance: number) => balance.toLocaleString(),
    },
    {
      title: 'Transferable Balance',
      dataIndex: 'transferableBalance',
      key: 'transferableBalance',
      render: (balance: number) => balance.toLocaleString(),
    },
  ];

  return (
    <>
      {isConnected && (
        <Table
          dataSource={tickerBalances}
          columns={balanceColumns}
          loading={loading}
          pagination={false}
          rowKey="tick"
        />
      )}
      {!isConnected && <p>Please connect to view inscriptions.</p>}
    </>
  );
};

export default LoadInscriptions;
