import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";
import { Reservation } from "../../../../features/reservation/types";
import { useReservations } from "../../../../features/reservation/queries";

type ReservationFilters = {
  date?: Date;
  time?: {
    from?: Date;
    to?: Date;
  };
};

export type ReservationContextType = {
  filters: Partial<ReservationFilters>;
  setFilters: Dispatch<SetStateAction<Partial<ReservationFilters>>>;
  reservations: Reservation[];
  activeSpace: string | undefined;
  setActiveSpace: Dispatch<SetStateAction<string | undefined>>;
};

export const ReservationContext = createContext<
  ReservationContextType | undefined
>(undefined);

interface Props {
  children: ReactNode;
}

function ReservationProvider({ children }: Props) {
  const [filters, setFilters] = useState<Partial<ReservationFilters>>({});

  const { data: reservationsData, isFetching: isFetchingReservations } =
    useReservations();

  const [activeSpace, setActiveSpace] = useState<string>();

  const contextValue: ReservationContextType = {
    filters,
    setFilters,
    reservations: reservationsData?.reservations || [],
    activeSpace,
    setActiveSpace,
  };

  return (
    <ReservationContext.Provider value={contextValue}>
      {children}
    </ReservationContext.Provider>
  );
}

export default ReservationProvider;
