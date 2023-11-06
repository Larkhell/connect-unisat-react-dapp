# Boilerplate for DApps on BRC20

## Overview

This boilerplate is a starting point for developers building decentralized applications (DApps) on the BRC20 token standard. It is configured with React and Ant Design, and it integrates with the Unisat Wallet API, simplifying the process of creating DApps capable of handling BRC20 tokens.

## Features

- React setup optimized for DApps on the BRC20 standard.
- Unisat Wallet API integration for wallet management and token operations.
- State management for BRC20 token balances and transaction history.
- User interface components from Ant Design for an engaging user experience.

## Installation

Begin by cloning the repository and installing the necessary dependencies:

```bash
git clone https://github.com/Larkhell/connect-unisat-react-dapp.git
cd connect-unisat-react-dapp
npm install
```

## Usage

To run the DApp in development mode:

```bash
npm start
```

This will start the development server and open the DApp in your default web browser.

## Project Structure

The boilerplate includes several key components:

- `App`: Main component that manages connections to the Unisat Wallet and the presentation of data.
- `Connect`: Handles the logic for wallet connections and displays user account details.
- `LoadInscriptions`: Fetches and processes wallet inscriptions from the Unisat Wallet.

## Customization

This boilerplate serves as a foundation. Customize and expand it by adding new components and features to suit the needs of your DApp.

## Contributing

We welcome contributions to this project. If you have suggestions or find bugs, please fork the repository, make your changes, and submit a pull request.

## Documentation

For detailed API documentation and more on the Unisat Wallet and BRC20 tokens, visit the [Unisat Wallet API documentation](https://docs.unisat.io/dev/unisat-wallet-api).

## Acknowledgements

Powered by Fairlight 2023, this project provides essential tools and support for the development of blockchain applications.
