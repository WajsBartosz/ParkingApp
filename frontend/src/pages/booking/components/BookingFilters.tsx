import { Calendar } from "primereact/calendar";
import useBooking from "../providers/BookingProvider/hooks";
import styles from "./BookingFilters.module.css";
import { useState } from "react";

interface Props {}

function BookingFilters({}: Props) {
  const { filters, setFilters } = useBooking();
  const [timeFrom, setTimeFrom] = useState<Date>(new Date());
  const [timeTo, setTimeTo] = useState<Date>(() => {
    const currentDate = new Date();
    const hourLater = new Date().setHours(currentDate.getHours() + 8);

    return new Date(hourLater);
  });

  return (
    <div className={styles.container}>
      <p className={styles.field}>
        <label>Data</label>
        <Calendar
          value={filters.date}
          onChange={(event) => {
            const val = event.value;
            if (val != null) {
              setFilters((prev) => ({ ...prev, date: val }));
            }
          }}
        />
      </p>

      <div>
        {filters.date && (
          <div>
            <p className={styles.field}>
              <label>Godzina od:</label>
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

            <p className={styles.field}>
              <label>Godzina do:</label>
              <Calendar
                timeOnly
                value={timeTo}
                minDate={timeFrom}
                onChange={(e) => {
                  const val = e.value;
                  if (val != null) {
                    setTimeTo(val);
                  }
                }}
              />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingFilters;
