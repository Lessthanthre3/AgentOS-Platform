import { ChakraProvider } from '@chakra-ui/react';
import ClientWalletProvider from '../components/web3/WalletProvider';
import theme from '../theme';

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <ClientWalletProvider>
        <Component {...pageProps} />
      </ClientWalletProvider>
    </ChakraProvider>
  );
}

export default MyApp;
