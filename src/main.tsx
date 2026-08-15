import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { NotFoundPage } from "./components/NotFoundPage";
import { isCurrentAppPath } from "./lib/appPath";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // 30 min — movie metadata rarely changes
      gcTime: 1000 * 60 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {isCurrentAppPath() ? <App /> : <NotFoundPage />}
    </QueryClientProvider>
  </React.StrictMode>,
);
