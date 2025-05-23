import ParkingMap from "./components/ParkingMap";
import ReservationProvider from "./providers/ReservationProvider/ReservationProvider";

import styles from "./ReservationPage.module.css";
import ActiveReservation from "./components/ActiveReservation";
import PendingReservations from "./components/PendingReservations";

function ReservationPage() {
  return (
    <main className={styles.container}>
      <h1>Rezerwacja miejsca parkingowego</h1>

      <ReservationProvider>
        <div className={styles["layout"]}>
          <ParkingMap />

          <div className={styles.reservations}>
            <ActiveReservation />
            <PendingReservations />
          </div>
        </div>
      </ReservationProvider>
    </main>
  );
}

export default ReservationPage;
