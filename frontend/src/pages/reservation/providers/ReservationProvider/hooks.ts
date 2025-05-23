import { useContext } from "react";
import { ReservationContext } from "./ReservationProvider";

function useReservationContext() {
  const context = useContext(ReservationContext);

  if (!context) {
    throw new Error(
      "`useReservationContext` hook used outside of <ReservationProvider>",
    );
  }

  return context;
}

export default useReservationContext;
