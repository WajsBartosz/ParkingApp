import { useContext } from "react";
import { BookingContext } from "./BookingProvider";

function useBooking() {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error("`useBooking` hook used outside of <BookingProvider>");
  }

  return context;
}

export default useBooking;
