import BookingSpot from "./BookingSpot";
import { SpotType } from "./types";
import styles from "./BookingMap.module.css";

const spots: SpotType[] = [
  {
    name: "A1",
  },
  { name: "A2" },
  { name: "A3" },
];

interface Props {}

function BookingMap({}: Props) {
  return (
    <div className={styles.container}>
      {spots.map((spot) => (
        <BookingSpot spot={spot} />
      ))}
    </div>
  );
}

export default BookingMap;
