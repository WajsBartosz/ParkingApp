import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAllSpaces,
  useAvailableSpaces,
} from "../../../features/reservation/queries";
import useReservationContext from "../providers/ReservationProvider/hooks";
import styles from "./ParkingMap.module.css";
import ParkingSpace from "./ParkingSpace";
import ReservationSidebar from "./ReservationSidebar";

type ParkingSpaceMeta = {
  x: number;
  y: number;
  width: number;
  height: number;
  reversed?: boolean;
};

const pillars = [
  {
    x: 170,
    y: 10,
    width: 55,
    height: 55,
  },

  {
    x: 110,
    y: 220,
    width: 55,
    height: 55,
  },
];

const parkingSpacesMap = new Map<string, ParkingSpaceMeta>([
  ["A1", { x: 70, y: 10, width: 40, height: 80 }],
  ["A2", { x: 120, y: 10, width: 40, height: 80 }],
  ["A3", { x: 60, y: 195, width: 40, height: 80 }],
  ["A4", { x: 10, y: 195, width: 40, height: 80 }],
]);

interface Props {}

function ParkingMap({}: Props) {
  const { filters } = useReservationContext();

  const parkingRef = useRef<SVGSVGElement>(null);

  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace>();

  const { data: allSpacesData, isFetching: isFetchingAllSpaces } =
    useAllSpaces();

  const { data: availableSpacesData, isFetching: isFetchingAvailableSpaces } =
    useAvailableSpaces({
      startTime: filters.date && format(filters.date, "yyyy-MM-dd HH:MM:SS"),
      endTime: filters.date && format(filters.date, "yyyy-MM-dd HH:MM:SS"),
    });

  useEffect(() => {
    console.log({ allSpacesData });
  }, [allSpacesData]);

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

  return (
    <div className={styles.container}>
      {isFetchingAllSpaces && <p>Pobieranie miejsc</p>}

      <div className={styles["header-container"]}>
        <span className={styles["header-title"]}>Mapa parkingu</span>
        <span className="info-text">Wybierz miejsce parkingowe</span>
      </div>

      <svg
        ref={parkingRef}
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect
          width="100%"
          height="100%"
          stroke="black"
          fill="#e5e5e5"
          rx={10}
        />

        <rect
          id="gate"
          stroke="black"
          rx={8}
          x={0}
          y={100}
          width={20}
          height={200}
        />

        {allSpacesData?.map((space, index) => {
          const mapEntry = parkingSpacesMap.get(space["parking-space"]);

          console.log("Map entry:", mapEntry);

          if (!mapEntry) return null;

          return (
            <>
              <rect
                key={space["parking-space"]}
                style={{ cursor: "pointer" }}
                fill="white"
                stroke="black"
                x={mapEntry.x}
                y={mapEntry.y}
                width={mapEntry.width}
                height={mapEntry.height}
                // fill={selected === space.id ? "green" : "gray"}
                onClick={() => setSelectedSpace(space)}
              />

              <text
                fill="black"
                fontSize="16"
                textAnchor="middle"
                alignmentBaseline="middle"
                x={mapEntry.x + mapEntry.width / 2}
                y={mapEntry.y + mapEntry.height / 2}
              >
                {space["parking-space"]}
              </text>
            </>
          );
        })}

        {pillars.map((pillar) => {
          return (
            <rect
              stroke="black"
              rx={5}
              x={pillar.x}
              y={pillar.y}
              width={pillar.width}
              height={pillar.height}
            />
          );
        })}

        {/* <svg */}
        {/*   xmlns="http://www.w3.org/2000/svg" */}
        {/*   x={10} */}
        {/*   y={10} */}
        {/*   viewBox="0 0 24 24" */}
        {/*   width="4em" */}
        {/*   height="4em" */}
        {/* > */}
        {/*   <path */}
        {/*     fill="none" */}
        {/*     stroke="currentColor" */}
        {/*     strokeLinecap="round" */}
        {/*     strokeLinejoin="round" */}
        {/*     strokeWidth="2" */}
        {/*     d="M5 12h14M5 12l4-4m-4 4l4 4" */}
        {/*   ></path> */}
        {/* </svg> */}
      </svg>

      {/* {allSpacesData?.map((space, index) => ( */}
      {/*   <ParkingSpace */}
      {/*     key={space["parking-space"]} */}
      {/*     space={space} */}
      {/*     disabled={disabledSpaces.has(space["parking-space"])} */}
      {/*     onClick={() => setSelectedSpace(space)} */}
      {/*   /> */}
      {/* ))} */}

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
