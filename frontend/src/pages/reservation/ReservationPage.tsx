import ParkingMap from "./components/ParkingMap";
import ReservationProvider from "./providers/ReservationProvider/ReservationProvider";

import styles from "./ReservationPage.module.css";
import ActiveReservation from "./components/ActiveReservation";

function ReservationPage() {
  return (
    <main className={styles.container}>
      <h1>Rezerwacja miejsca parkingowego</h1>

      <ReservationProvider>
        <div>
          <ActiveReservation />
          <ParkingMap />
        </div>
      </ReservationProvider>
    </main>
  );
}

export default ReservationPage;
