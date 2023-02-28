import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { Poppins } from "@next/font/google";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";

import { useMe } from "@/hooks/useMe";
import { GlobalStyles } from "@/styles/global";
import { queryClient } from "@/utils/queryClient";
import { useMeStore } from "@/utils/stores/useMeStore";

const poppins = Poppins({
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

function MyApp({ Component, pageProps }: AppProps) {
  useFetchUser();

  return (
    <>
      <Head>
        <title>Aventus</title>
      </Head>
      <QueryClientProvider client={queryClient}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            primaryColor: "teal",
            colorScheme: "light",
            fontFamily: poppins.style.fontFamily,
            headings: { fontFamily: poppins.style.fontFamily },
          }}
        >
          <GlobalStyles />
          <NotificationsProvider position="top-right">
            <Component {...pageProps} />
          </NotificationsProvider>
        </MantineProvider>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;

const useFetchUser = () => {
  const { fetchMe } = useMe();
  const me = useMeStore((state) => state.me);

  useEffect(() => {
    if (typeof window !== undefined && !me) {
      fetchMe();
    }
  }, [fetchMe, me]);
};
