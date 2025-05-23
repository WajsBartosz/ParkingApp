import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/home/Home.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./lib/query-client.ts";
import RootLayout from "./layouts/RootLayout.tsx";
import ReservationPage from "./pages/reservation/ReservationPage.tsx";
import { PrimeReactProvider } from "primereact/api";

import { ToastContainer } from "react-toastify";

import "primereact/resources/themes/lara-light-cyan/theme.css";
import AuthProvider from "./features/auth/AuthProvider.tsx";
import ProtectedRoute from "./features/auth/ProtectedRoute.tsx";
import LoginPage from "./pages/login/Login.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <PrimeReactProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route element={<RootLayout />}>
                {/* <Route index path="/" element={<Home />} /> */}

                <Route
                  index
                  path="/"
                  element={
                    <ProtectedRoute>
                      <ReservationPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>

        <ToastContainer position="bottom-right" theme="light" />
      </PrimeReactProvider>
    </QueryClientProvider>
  </StrictMode>,
);
