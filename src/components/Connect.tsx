import React, { useContext } from 'react';
import { Button, Dropdown, Menu, Space, Typography, Switch, message } from 'antd';
import { CopyOutlined, LinkOutlined } from '@ant-design/icons';
import { ConnectionContext } from './ConnectionContext';

const { Text } = Typography;

const Connect = () => {
  const {
    isConnected,
    currentAccount,
    balance,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    network,
  } = useContext(ConnectionContext);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('Address copied to clipboard');
    });
  };

  const getExplorerLink = () => {
    return network === 'livenet'
      ? `https://mempool.space/address/${currentAccount}`
      : `https://mempool.space/testnet/address/${currentAccount}`;
  };

  const handleNetworkSwitch = () => {
    // Call switchNetwork without any arguments
    switchNetwork();
  };

  const accountMenu = (
    <Menu
      items={[
        {
          label: (
            <Space>
              Your wallet:
              <Text>{currentAccount}</Text>
              <Button
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(currentAccount)}
              />
              <Button
                icon={<LinkOutlined />}
                href={getExplorerLink()}
                target="_blank"
              />
            </Space>
          ),
          key: 'wallet-address',
        },
        {
          type: 'divider',
        },
        {
          label: 'Switch network',
          key: 'network',
          children: [
            {
              label: (
                <Space>
                  Testnet
                  <Switch checked={network === 'livenet'} onChange={handleNetworkSwitch} />
                  Livenet
                </Space>
              ),
              key: 'network-switch',
            },
          ],
        },
        {
          type: 'divider',
        },
        {
          label: 'Disconnect',
          key: 'disconnect',
          onClick: disconnectWallet,
        },
      ]}
    />
  );

  return (
    <Space>
      {isConnected ? (
        <>
          <Text style={{ color: 'white' }}>{(balance.total / 100000000).toFixed(8)} BTC</Text>
          <Dropdown overlay={accountMenu} placement="bottomRight">
            <Button>{currentAccount ? `${currentAccount.substring(0, 6)}...` : 'Select Account'}</Button>
          </Dropdown>
        </>
      ) : (
        <Button onClick={connectWallet}>Connect to Wallet</Button>
      )}
    </Space>
  );
};

export default Connect;
