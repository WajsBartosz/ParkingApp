import Countdown, { CountdownRenderProps } from "react-countdown";
import { useActiveReservation } from "../../../features/reservation/queries";
import { Panel } from "primereact/panel";
import styles from "./ActiveReservation.module.css";
import { Button } from "primereact/button";
import { format } from "date-fns";
import { useEffect } from "react";
import useReservationContext from "../providers/ReservationProvider/hooks";

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

interface Props {}

function ActiveReservation({}: Props) {
  const { setActiveSpace } = useReservationContext();
  const { data, isFetching, refetch } = useActiveReservation();

  const reservation = data?.reservation;

  useEffect(() => {
    if (data?.reservation) {
      setActiveSpace(data.reservation["parking-space"]);
    }
  }, [data?.reservation]);

  return (
    <Panel header="Twoja rezerwacja">
      <div className={styles["reservation-info"]}>
        <div>
          <span>
            Zarezerwowane miejsce: <b>{reservation?.["parking-space"]}</b>
          </span>

          <div>Rezerwacja ważna jeszcze przez:</div>
          {reservation != null && (
            <Countdown
              date={new Date(reservation.end).getTime()}
              renderer={renderer}
              onComplete={() => {
                refetch();
              }}
            />
          )}
        </div>

        <div>
          <Button disabled size="small" severity="danger" outlined>
            Anuluj rezerwację
          </Button>
        </div>
      </div>
    </Panel>
  );
}

export default ActiveReservation;
