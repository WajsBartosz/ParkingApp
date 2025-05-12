import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import {
  useAllSpaces,
  useAvailableSpaces,
} from "../../../features/booking/queries";
import useBooking from "../providers/BookingProvider/hooks";
import styles from "./BookingMap.module.css";
import ParkingSpace from "./ParkingSpace";
import ReservationSidebar from "./ReservationSidebar";

interface Props {}

function BookingMap({}: Props) {
  const { filters } = useBooking();

  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace>();

  const { data: allSpacesData, isFetching: isFetchingAllSpaces } =
    useAllSpaces();

  const { data: availableSpacesData, isFetching: isFetchingAvailableSpaces } =
    useAvailableSpaces({
      startTime: filters.date && format(filters.date, "yyyy-MM-dd HH:MM:SS"),
      endTime: filters.date && format(filters.date, "yyyy-MM-dd HH:MM:SS"),
    });

  useEffect(() => {
    console.log({ availableSpacesData });
  }, [availableSpacesData]);

  const disabledSpaces = useMemo<Set<string>>(() => {
    const spaceNames = new Set<string>();

    if (!allSpacesData) {
      return spaceNames;
    }

    for (const space of allSpacesData) {
      if (Boolean(Math.round(Math.random()))) {
        spaceNames.add(space["parking-space"]);
      }
    }

    return spaceNames;
  }, [allSpacesData]);

  console.log({ disabledSpaces });

  return (
    <div className={styles.container}>
      {isFetchingAllSpaces && <p>Pobieranie miejsc</p>}
      {allSpacesData?.map((space, index) => (
        <ParkingSpace
          key={space["parking-space"]}
          space={space}
          disabled={disabledSpaces.has(space["parking-space"])}
          onClick={() => setSelectedSpace(space)}
        />
      ))}
      {/* {isFetchingAvailableSpaces && <p>Pobieranie wolnych miejsc</p>} */}
      {/* {data?.map((parkingSpace) => <ParkingSpace space={parkingSpace} />)} */}

      <ReservationSidebar
        visible={selectedSpace !== undefined}
        position="right"
        space={selectedSpace}
        onHide={() => setSelectedSpace(undefined)}
      />
    </div>
  );
}

export default BookingMap;
