import ParkingMap from "./components/ParkingMap";
import ReservationProvider from "./providers/ReservationProvider/ReservationProvider";

import styles from "./ReservationPage.module.css";
import ActiveReservation from "./components/ActiveReservation";

function ReservationPage() {
  return (
    <main>
      <h1>Rezerwacja miejsca parkingowego</h1>

      <ReservationProvider>
        <div className={styles.container}>
          <ActiveReservation />
          <ParkingMap />
        </div>
      </ReservationProvider>
    </main>
  );
}

export default ReservationPage;
