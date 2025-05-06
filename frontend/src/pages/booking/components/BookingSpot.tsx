import { SpotType } from "./types";
import styles from "./BookingSpot.module.css";

interface Props {
  spot: SpotType;
}

function BookingSpot({ spot }: Props) {
  return (
    <div className={styles.container}>
      <p>
        Miejsce <b>{spot.name}</b>
      </p>
    </div>
  );
}

export default BookingSpot;
