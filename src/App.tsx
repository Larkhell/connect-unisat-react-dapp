import React from 'react';
import { Layout, Typography } from 'antd';
import ConnectionProvider from './components/ConnectionContext';
import Connect from './components/Connect';
import LoadInscriptions from './components/LoadInscriptions';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  return (
    <ConnectionProvider>
      <Layout className="layout">
        <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', backgroundColor: '#1890ff' }}>
          <Title level={3} style={{ color: 'white', margin: 0 }}>Boilerplate Dapps on Bitcoin</Title>
          <Connect />
        </Header>
        <Content style={{ padding: '20px', marginTop: '64px' }}>
          <LoadInscriptions />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
                Powered by Fairlight 2023
              </Footer>
      </Layout>
    </ConnectionProvider>
  );
};

export default App;
