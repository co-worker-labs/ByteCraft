import { Html, Head, Main, NextScript } from 'next/document'
import { ToastContainer } from '../components/toast'

export default function Document() {
  return (
    <Html lang="en">
      <Head >
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
        <ToastContainer />
      </body>
    </Html>
  )
}
