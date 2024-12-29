import { ChakraProvider } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import theme from '../theme';

const ClientWalletProvider = dynamic(
  () => import('../components/web3/WalletProvider'),
  { ssr: false }
);

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
