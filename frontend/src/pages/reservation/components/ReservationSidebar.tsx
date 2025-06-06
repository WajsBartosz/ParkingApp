import { Button } from "primereact/button";
import { Sidebar, SidebarProps } from "primereact/sidebar";
import { ParkingSpace } from "../../../features/reservation/types";

import { BlockUI } from "primereact/blockui";
import { Calendar } from "primereact/calendar";
import { ProgressSpinner } from "primereact/progressspinner";
import { useState } from "react";
import { toast } from "react-toastify";
import { useBookParkingSpace } from "../../../features/reservation/mutations";
import styles from "./ReservationSidebar.module.css";

interface Props extends SidebarProps {
  space?: ParkingSpace;
}

function ReservationSidebar({ space, ...props }: Props) {
  const { mutate: bookParkingSpace, isPending } = useBookParkingSpace();

  const [timeFrom, setTimeFrom] = useState<Date>(new Date());
  const [timeTo] = useState<Date>(() => {
    const currentDate = new Date();
    const hourLater = new Date().setHours(currentDate.getHours() + 8);

    return new Date(hourLater);
  });

  function handleBookSpace() {
    if (!space || !timeFrom || !timeTo) {
      return;
    }

    bookParkingSpace(
      {
        parkingSpace: space["parking-space"],
        startTime: timeFrom,
      },
      {
        onSuccess: () => {
          props.onHide();

          toast(<div>Pomyślnie utworzono rezerwację</div>, {
            type: "success",
          });
        },
      },
    );
  }

  if (!space) {
    return null;
  }

  return (
    <Sidebar {...props}>
      <BlockUI
        blocked={isPending}
        fullScreen
        template={
          <div className={styles.blockui}>
            <ProgressSpinner />
            <p>Trwa rezerwowanie...</p>
          </div>
        }
      >
        <div className={styles["sidebar-container"]}>
          <h1>Miejsce {space["parking-space"]}</h1>

          <p className="field">
            <label>
              <b>Data</b>
            </label>
            <Calendar
              value={timeFrom}
              minDate={new Date()}
              onChange={(e) => {
                const val = e.value;
                if (val != null) {
                  setTimeFrom(val);
                }
              }}
            />
          </p>

          <p className="field">
            <label>
              <b>Godzina od</b>
            </label>
            <span className=" info-text">
              Rezerwacja jest ważna 30 minut od wskazanej godziny
            </span>
            <Calendar
              timeOnly
              value={timeFrom}
              minDate={new Date()}
              maxDate={timeTo}
              onChange={(e) => {
                const val = e.value;
                if (val != null) {
                  setTimeFrom(val);
                }
              }}
            />
          </p>

          {/* <p className="field"> */}
          {/*   <label>Godzina do:</label> */}
          {/*   <Calendar */}
          {/*     timeOnly */}
          {/*     value={timeTo} */}
          {/*     minDate={timeFrom} */}
          {/*     onChange={(e) => { */}
          {/*       const val = e.value; */}
          {/*       if (val != null) { */}
          {/*         setTimeTo(val); */}
          {/*       } */}
          {/*     }} */}
          {/*   /> */}
          {/* </p> */}

          <Button onClick={handleBookSpace}>Zarezerwuj miejsce</Button>
        </div>
      </BlockUI>
    </Sidebar>
  );
}

export default ReservationSidebar;
