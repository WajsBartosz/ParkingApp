import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import {
  useAllSpaces,
  useAvailableSpaces,
} from "../../../features/reservation/queries";
import useReservationContext from "../providers/ReservationProvider/hooks";
import styles from "./ParkingMap.module.css";
import ParkingSpace from "./ParkingSpace";
import ReservationSidebar from "./ReservationSidebar";

interface Props {}

function ParkingMap({}: Props) {
  const { filters } = useReservationContext();

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

export default ParkingMap;
