import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Table, message } from 'antd';
import axios from 'axios';
import { ConnectionContext } from './ConnectionContext';

interface Inscription {
  inscriptionId: string;
  content: string;
  jsonData?: any;
}

interface TickerBalance {
  tick: string;
  balance: number;
  inscriptions: Inscription[];
}

const pageSize = 100;

async function fetchContentData(contentUrl: string): Promise<any> {
  const response = await axios.get(contentUrl);
  return response.data;
}

async function processInscriptions(inscriptions: Inscription[]): Promise<TickerBalance[]> {
  const balances: { [tick: string]: { balance: number; inscriptions: Inscription[] } } = {};
  for (const inscription of inscriptions) {
    const data = await fetchContentData(inscription.content);
    if (data && (data.op === 'transfer' || data.op === 'mint')) {
      const tick = data.tick.toLowerCase();
      const amt = parseFloat(data.amt);
      balances[tick] = balances[tick] || { balance: 0, inscriptions: [] };
      balances[tick].balance += amt;
      balances[tick].inscriptions.push({ ...inscription, jsonData: data });
    }
  }
  return Object.keys(balances).map(tick => ({ tick, ...balances[tick] }));
}

const LoadInscriptions: React.FC = () => {
  const { isConnected, network } = useContext(ConnectionContext);
  const [tickerBalances, setTickerBalances] = useState<TickerBalance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalInscriptions, setTotalInscriptions] = useState<number>(0);

  const loadInscriptions = useCallback(async () => {
    if (!isConnected) {
      message.info('Please connect to load inscriptions.');
      return;
    }
    setLoading(true);
    try {
      const initialResponse = await window.unisat.getInscriptions(0, pageSize);
      setTotalInscriptions(initialResponse.total);
      if (initialResponse.total === 0) {
        setLoading(false);
        return;
      }
      const pages = Math.ceil(initialResponse.total / pageSize);
      const inscriptionsPromises = Array.from({ length: pages }, (_, pageIndex) =>
        window.unisat.getInscriptions(pageIndex * pageSize, pageSize)
      );
      const inscriptionsResponses = await Promise.all(inscriptionsPromises);
      const allInscriptions = inscriptionsResponses.flatMap(res => res.list);
      const processedBalances = await processInscriptions(allInscriptions);
      setTickerBalances(processedBalances);
    } catch (error) {
      console.error('Failed to load inscriptions:', error);
      message.error('Failed to load inscriptions');
      setTickerBalances([]);
      setTotalInscriptions(0);
    } finally {
      setLoading(false);
    }
  }, [isConnected, network]);

  useEffect(() => {
    loadInscriptions();
  }, [loadInscriptions, network]);

  const balanceColumns = [
    {
      title: 'Ticker',
      dataIndex: 'tick',
      key: 'tick',
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: number) => balance.toLocaleString(),
    },
    {
      title: 'Inscriptions',
      key: 'inscriptions',
      render: (_: any, record: TickerBalance) => (
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {record.inscriptions.map((inscription) => (
            <div key={inscription.inscriptionId}>
              {JSON.stringify(inscription.jsonData, null, 2)}
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      {isConnected && totalInscriptions > 0 && (
        <>
          <h2>Total inscriptions: {totalInscriptions}</h2>
          <Table
            dataSource={tickerBalances}
            columns={balanceColumns}
            loading={loading}
            pagination={false}
            rowKey="tick"
          />
        </>
      )}
      {isConnected && totalInscriptions === 0 && !loading && <p>No inscriptions found.</p>}
      {!isConnected && <p>Please connect to view inscriptions.</p>}
    </>
  );
};

export default LoadInscriptions;
