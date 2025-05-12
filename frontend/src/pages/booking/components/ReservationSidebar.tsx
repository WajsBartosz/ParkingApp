import { Sidebar, SidebarProps } from "primereact/sidebar";
import { ParkingSpace } from "../../../features/booking/types";
import { Button } from "primereact/button";

import styles from "./ReservationSidebar.module.css";
import { useBookParkingSpace } from "../../../features/booking/mutations";
import useBooking from "../providers/BookingProvider/hooks";

interface Props extends SidebarProps {
  space?: ParkingSpace;
}

function ReservationSidebar({ space, ...props }: Props) {
  const { filters } = useBooking();
  const { mutate: bookParkingSpace } = useBookParkingSpace();

  function handleBookSpace() {
    if (!space || !filters.time?.from || !filters.time.to) {
      return;
    }

    bookParkingSpace({
      parkingSpace: space["parking-space"],
      startTime: filters.time.from,
      endTime: filters.time.to,
    });
  }

  if (!space) {
    return null;
  }

  return (
    <Sidebar {...props}>
      <div className={styles["sidebar-container"]}>
        <h1>Miejsce {space["parking-space"]}</h1>

        <Button onClick={handleBookSpace}>Zarezerwuj miejsce</Button>
      </div>
    </Sidebar>
  );
}

export default ReservationSidebar;
