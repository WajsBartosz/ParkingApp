import useBooking from "../providers/BookingProvider/hooks";
import styles from "./BookingFilters.module.css";

// <label htmlFor="day">Wybierz dzień tygodnia:</label>
// <select
//   id="day"
//   name="day"
//   onChange={(event) => setFilters((prev) => ({...prev, }))}
// >
//   <option value="monday">Poniedziałek</option>
//   <option value="tuesday">Wtorek</option>
//   <option value="wednesday">Środa</option>
//   <option value="thursday">Czwartek</option>
//   <option value="friday">Piątek</option>
//   <option value="saturday">Sobota</option>
//   <option value="sunday">Niedziela</option>
// </select>

interface Props {}

function BookingFilters({}: Props) {
  const { filters, setFilters } = useBooking();
  return (
    <div className={styles.container}>
      <label>Data</label>
      <input
        type="date"
        onChange={(event) =>
          setFilters((prev) => ({
            ...prev,
            date: new Date(event.target.value),
          }))
        }
      />

      <div>
        {filters.date && (
          <>
            <p className="field">
              <label>Godzina od:</label>
              <input type="time" />
            </p>

            <p className="field">
              <label>Godzina do:</label>
              <input type="time" />
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default BookingFilters;
