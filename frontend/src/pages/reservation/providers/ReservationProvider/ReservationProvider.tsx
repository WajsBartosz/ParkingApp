import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

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
};

export const ReservationContext = createContext<
  ReservationContextType | undefined
>(undefined);

interface Props {
  children: ReactNode;
}

function ReservationProvider({ children }: Props) {
  const [filters, setFilters] = useState<Partial<ReservationFilters>>({});

  const contextValue: ReservationContextType = {
    filters,
    setFilters,
  };

  return (
    <ReservationContext.Provider value={contextValue}>
      {children}
    </ReservationContext.Provider>
  );
}

export default ReservationProvider;
