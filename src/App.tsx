// Abstract:
// This React component fetches and displays ticker balances and inscriptions from the Unisat API.
// It shows a table of ticker symbols with their corresponding balances and a detailed view of inscriptions.
// The component handles data fetching, error handling, and state management for a seamless user experience.

import React, { useEffect, useState, useCallback } from 'react';
import { Card, Layout, Table, message } from 'antd';
import axios from 'axios';
import './App.css';

const { Header, Content } = Layout;

// Define the structure for Inscription and TickerBalance objects
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

// Set the number of inscriptions to fetch per page
const pageSize = 100;

// Function to fetch data from a content URL
const fetchContentData = async (contentUrl: string): Promise<any> => {
  try {
    const response = await axios.get(contentUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching content data:', error);
    return null;
  }
};

// Declare global variable for Unisat API access
declare global {
  interface Window { unisat: any; }
}

const App: React.FC = () => {
  const [tickerBalances, setTickerBalances] = useState<TickerBalance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalInscriptions, setTotalInscriptions] = useState<number>(0);

  const unisat = window.unisat;

  // Function to load inscriptions from the Unisat API
  const loadInscriptions = useCallback(async () => {
    if (unisat) {
      setLoading(true);
      try {
        const initialResponse = await unisat.getInscriptions(0, pageSize);
        const total = initialResponse.total;
        setTotalInscriptions(total);

        const pages = Math.ceil(total / pageSize);
        const inscriptionsPromises = Array.from({ length: pages }, (_, pageIndex) =>
          unisat.getInscriptions(pageIndex * pageSize, pageSize)
        );

        const inscriptionsResponses = await Promise.all(inscriptionsPromises);
        const allInscriptions = inscriptionsResponses.flatMap(res => res.list);

        const uniqueInscriptions = new Map(allInscriptions.map(ins => [ins.inscriptionId, ins]));

        const balances: { [tick: string]: { balance: number; inscriptions: Inscription[] } } = {};

        await Promise.all(Array.from(uniqueInscriptions.values()).map(async (inscription) => {
          const data = await fetchContentData(inscription.content);
          if (data && (data.op === 'transfer' || data.op === 'mint')) {
            const tick = data.tick.toLowerCase();
            const amt = parseFloat(data.amt);
            if (!balances[tick]) {
              balances[tick] = { balance: 0, inscriptions: [] };
            }
            balances[tick].balance += amt;
            balances[tick].inscriptions.push({ ...inscription, jsonData: data });
          }
        }));

        setTickerBalances(Object.entries(balances).map(([tick, { balance, inscriptions }]) => ({
          tick,
          balance,
          inscriptions
        })));
      } catch (error) {
        console.error('Failed to load inscriptions:', error);
        message.error('Failed to load inscriptions');
      } finally {
        setLoading(false);
      }
    }
  }, [unisat]);

  // Load inscriptions on component mount
  useEffect(() => {
    loadInscriptions();
  }, [loadInscriptions]);

  // Define columns for the Ant Design Table component
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
            // Convert the jsonData object to a string for rendering
            <div key={inscription.inscriptionId}>
              {JSON.stringify(inscription.jsonData, null, 2)}
            </div>
          ))}
        </div>
      ),
    },
  ];

  // Render the layout with the table of ticker balances
  return (
    <Layout className="layout">
      <Header>
        {/* Header can be customized as needed */}
      </Header>
      <Content style={{ padding: '50px', overflowX: 'auto' }}>
        <div className="site-layout-content">
          <Card title={`Ticker Balances - ${totalInscriptions} Inscriptions Found`} bordered={false}>
            <Table dataSource={tickerBalances} columns={balanceColumns} loading={loading} pagination={false} rowKey="tick" />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default App;
