import Countdown, { CountdownRenderProps } from "react-countdown";
import { useActiveReservation } from "../../../features/reservation/queries";
import { Panel } from "primereact/panel";
import styles from "./ActiveReservation.module.css";
import { Button } from "primereact/button";
import { format } from "date-fns";
import { MouseEvent, useEffect, useRef } from "react";
import useReservationContext from "../providers/ReservationProvider/hooks";
import api from "../../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Toast } from "primereact/toast";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";

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

async function deleteActiveReservation() {
  const response = api.delete("reservations/active");

  return response.json();
}

function useDeleteActiveReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteActiveReservation"],
    mutationFn: deleteActiveReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reservations"],
      });

      queryClient.invalidateQueries({
        queryKey: ["activeReservation"],
      });
    },
  });
}

interface Props {}

function ActiveReservation({}: Props) {
  const toast = useRef<Toast>(null);

  const { setActiveSpace } = useReservationContext();
  const { data, isFetching, refetch } = useActiveReservation();

  const { mutate } = useDeleteActiveReservation();

  const reservation = data?.reservation;

  useEffect(() => {
    if (data?.reservation) {
      setActiveSpace(data.reservation["parking-space"]);
    }
  }, [data?.reservation]);

  function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    confirmPopup({
      target: event.currentTarget,
      message: "Czy na pewno chcesz anulować swoją rezerwację?",
      icon: "pi pi-times-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      acceptLabel: "Anuluj rezerwację",
      accept: () => {
        mutate(undefined, {
          onSuccess: () => setActiveSpace(undefined),
        });
      },
      rejectLabel: "Wróć",
    });
  }

  return (
    <Panel header="Twoja rezerwacja">
      <div className={styles["reservation-info"]}>
        <div>
          {reservation == null && (
            <span className=" info-text">Brak rezerwacji</span>
          )}

          {reservation != null && (
            <>
              <span>
                Zarezerwowane miejsce: <b>{reservation?.["parking-space"]}</b>
              </span>

              <div>Rezerwacja ważna jeszcze przez:</div>

              <Countdown
                date={new Date(reservation.end).getTime()}
                renderer={renderer}
                onComplete={() => {
                  refetch();
                }}
              />
            </>
          )}
        </div>

        <Toast ref={toast} />
        <ConfirmPopup />
        {reservation != null && (
          <div>
            <Button
              size="small"
              severity="danger"
              outlined
              onClick={handleDelete}
            >
              Anuluj rezerwację
            </Button>
          </div>
        )}
      </div>
    </Panel>
  );
}

export default ActiveReservation;
