import BookingFilters from "./components/BookingFilters";
import BookingMap from "./components/BookingMap";
import BookingProvider from "./providers/BookingProvider/BookingProvider";

function BookingPage() {
  return (
    <main>
      <h1>Strona rezerwacji</h1>

      <BookingProvider>
        <BookingFilters />
        <BookingMap />
      </BookingProvider>
    </main>
  );
}

export default BookingPage;
