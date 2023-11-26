import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from './App';
import { ConnectionProvider } from './components/ConnectionContext';

// Mock child components if necessary
jest.mock('./components/Connect', () => {
  return {
    __esModule: true,
    default: () => <div>Connect Component</div>,
  };
});

jest.mock('./components/LoadInscriptions', () => {
  return {
    __esModule: true,
    default: () => <div>LoadInscriptions Component</div>,
  };
});

describe('App Component', () => {
  test('renders App and child components', async () => {
    render(
      <ConnectionProvider>
        <App />
      </ConnectionProvider>
    );

    // Check if the Connect component is rendered
    expect(screen.getByText('Connect Component')).toBeInTheDocument();

    // Check if the LoadInscriptions component is rendered
    expect(screen.getByText('LoadInscriptions Component')).toBeInTheDocument();

    // Add more assertions here to test different parts of the App component
  });

  // You can add more tests to simulate user interactions, context changes, etc.
});