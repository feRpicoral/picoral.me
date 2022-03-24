import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import smoothscroll from 'smoothscroll-polyfill';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html, 
  body {
    margin: 0;
    padding: 0;
    scroll-behavior: smooth;
  }
  * {
    box-sizing: border-box; 
  } 
`;

export default function App({ Component, pageProps }: AppProps) {
    useEffect(() => {
        smoothscroll.polyfill();
    }, []);

    return (
        <>
            <GlobalStyle />
            <Component {...pageProps} />
        </>
    );
}
