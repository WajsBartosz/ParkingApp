import styles from "./ParkingSpace.module.css";
import { type ParkingSpace } from "../../../features/booking/types";

interface Props {
  space: ParkingSpace;
}

function ParkingSpace({ space }: Props) {
  return (
    <div className={styles.container}>
      <p>
        Miejsce <b>{space["parking-space"]}</b>
      </p>
    </div>
  );
}

export default ParkingSpace;
