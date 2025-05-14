import BookingFilters from "./components/BookingFilters";
import BookingMap from "./components/BookingMap";
import BookingProvider from "./providers/BookingProvider/BookingProvider";

import styles from "./BookingPage.module.css";

function BookingPage() {
  return (
    <main>
      <h1>Rezerwacja miejsca parkingowego</h1>

      <BookingProvider>
        <div className={styles.container}>
          {/* <BookingFilters /> */}
          <BookingMap />
        </div>
      </BookingProvider>
    </main>
  );
}

export default BookingPage;
