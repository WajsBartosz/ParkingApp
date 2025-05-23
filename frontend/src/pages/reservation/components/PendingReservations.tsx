import { Panel } from "primereact/panel";
import useReservationContext from "../providers/ReservationProvider/hooks";

import styles from "./PendingReservations.module.css";
import Countdown, { CountdownRenderProps } from "react-countdown";

const renderer = ({
  hours,
  minutes,
  seconds,
  completed,
}: CountdownRenderProps) => {
  return (
    <span>
      <b>
        {hours < 10 ? `0${hours}` : hours}:
        {minutes < 10 ? `0${minutes}` : minutes}:
        {seconds < 10 ? `0${seconds}` : seconds}
      </b>
    </span>
  );
};

function PendingReservations() {
  const { reservations, activeSpace } = useReservationContext();

  return (
    <div>
      <Panel header="Pozostałe rezerwacje">
        {reservations.length === 0 && (
          <span className=" info-text">Brak innych rezerwacji</span>
        )}

        <div className={styles["reservations-list"]}>
          {reservations
            .filter(
              (reservation) =>
                reservation["parking-space"] !== activeSpace &&
                reservation["confirmed-reservation"] === 0,
            )
            .map((reservation) => (
              <div className={styles["reservation-item"]}>
                <span>
                  Miejsce: <b>{reservation["parking-space"]}</b>
                </span>

                <span>
                  Pozostały czas:
                  <br />
                  <b>
                    <Countdown
                      date={new Date(reservation.end).getTime()}
                      renderer={renderer}
                    />
                  </b>
                </span>
              </div>
            ))}
        </div>
      </Panel>
    </div>
  );
}

export default PendingReservations;
