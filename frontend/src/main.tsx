import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/home/Home.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./lib/query-client.ts";
import RootLayout from "./layouts/RootLayout.tsx";
import BookingPage from "./pages/booking/BookingPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index path="/" element={<Home />} />
            <Route path="/rezerwacja" element={<BookingPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
