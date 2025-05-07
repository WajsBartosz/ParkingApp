import BookingSpot from "./BookingSpot";
import { SpotType } from "./types";
import styles from "./BookingMap.module.css";
import useBooking from "../providers/BookingProvider/hooks";
import { useAvailableSpaces } from "../../../features/booking/queries";
import { format } from "date-fns";

const spots: SpotType[] = [
  {
    name: "A1",
  },
  { name: "A2" },
  { name: "A3" },
];

interface Props {}

function BookingMap({}: Props) {
  const { filters } = useBooking();

  const { data } = useAvailableSpaces({
    startTime: filters.date && format(filters.date, "yyyy-MM-dd HH:MM:SS"),
    endTime: filters.date && format(filters.date, "yyyy-MM-dd HH:MM:SS"),
  });

  console.log("Data:", data);

  return (
    <div className={styles.container}>
      {spots.map((spot) => (
        <BookingSpot spot={spot} />
      ))}
    </div>
  );
}

export default BookingMap;
