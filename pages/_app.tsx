import "../styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "components/Layout";
import { AnimatePresence, domAnimation, LazyMotion } from "framer-motion";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <LazyMotion features={domAnimation} strict>
      <AnimatePresence mode="wait">
        <Layout key={router.pathname}>
          <Component {...pageProps} />
        </Layout>
      </AnimatePresence>
    </LazyMotion>
  );
}

export default MyApp;
