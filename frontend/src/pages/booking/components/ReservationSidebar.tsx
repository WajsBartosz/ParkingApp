import { Sidebar, SidebarProps } from "primereact/sidebar";
import { ParkingSpace } from "../../../features/booking/types";
import { Button } from "primereact/button";

import styles from "./ReservationSidebar.module.css";

interface Props extends SidebarProps {
  space?: ParkingSpace;
}

function ReservationSidebar({ space, ...props }: Props) {
  if (!space) {
    return null;
  }

  function handleBookSpace() {}

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
