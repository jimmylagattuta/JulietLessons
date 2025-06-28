import React from 'react';
import { Provider } from 'jotai';
import ThemeProvider from './ThemeProvider';

interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <Provider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </Provider>
  );
};

export default AppProvider; 