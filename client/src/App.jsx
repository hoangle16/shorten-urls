import { Suspense } from "react";
import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./features/auth/state/AuthContext";
import Loading from "./components/Loading";
import { ToastProvider } from "./state/ToastContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <ErrorBoundary>
            <Suspense fallback={<Loading fullScreen={true} />}>
              <AppRoutes />
            </Suspense>
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;
