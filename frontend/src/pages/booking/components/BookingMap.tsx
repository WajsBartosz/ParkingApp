import { format } from "date-fns";
import { useAvailableSpaces } from "../../../features/booking/queries";
import useBooking from "../providers/BookingProvider/hooks";
import styles from "./BookingMap.module.css";
import ParkingSpace from "./ParkingSpace";

interface Props {}

function BookingMap({}: Props) {
  const { filters } = useBooking();

  const { data, isFetching } = useAvailableSpaces({
    startTime: filters.date && format(filters.date, "yyyy-MM-dd HH:MM:SS"),
    endTime: filters.date && format(filters.date, "yyyy-MM-dd HH:MM:SS"),
  });

  console.log("Data:", data);

  return (
    <div className={styles.container}>
      {isFetching && <p>Pobieranie wolnych miejsc</p>}
      {data?.map((parkingSpace) => <ParkingSpace space={parkingSpace} />)}
    </div>
  );
}

export default BookingMap;
