import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

type BookingFilters = {
  date?: Date;
  time?: {
    from?: Date;
    to?: Date;
  };
};

export type BookingContextType = {
  filters: Partial<BookingFilters>;
  setFilters: Dispatch<SetStateAction<Partial<BookingFilters>>>;
};

export const BookingContext = createContext<BookingContextType | undefined>(
  undefined,
);

interface Props {
  children: ReactNode;
}

function BookingProvider({ children }: Props) {
  const [filters, setFilters] = useState<Partial<BookingFilters>>({});

  const contextValue: BookingContextType = {
    filters,
    setFilters,
  };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
}

export default BookingProvider;
