import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAllSpaces,
  useAvailableSpaces,
} from "../../../features/reservation/queries";
import useReservationContext from "../providers/ReservationProvider/hooks";
import styles from "./ParkingMap.module.css";
import ReservationSidebar from "./ReservationSidebar";
import { ParkingSpace } from "../../../features/reservation/types";

type ParkingSpaceMeta = {
  x: number;
  y: number;
};

type ParkingSpaceMap = Map<string, ParkingSpaceMeta>;

type ParkingSpaceRow = {
  x: number;
  y: number;
  spacesMap: ParkingSpaceMap;
};

const pillarSize = 700;
const padding = 200;
const width = 1000;
const height = 2000;

const pillars = [
  {
    x: 0 + padding,
    y: 0 + padding,
  },
  {
    x: 0 + padding,
    y: 10000 - pillarSize - padding,
  },
  {
    x: 10000 - padding - pillarSize,
    y: 0 + padding,
  },
  {
    x: 10000 - padding - pillarSize,
    y: 10000 - padding - pillarSize,
  },
  {
    x: 0 + padding,
    y: 10000 - pillarSize - padding,
  },
  {
    x: 1600 + 3 * (width + padding),
    y: 2200,
  },

  {
    x: 1600 + 3 * (width + padding),
    y: 2200 + height - pillarSize,
  },
] as const;

const parkingSpaceRows = [
  {
    x: 1600,
    y: 2200,
    spaces: ["A1", "A2", "A3"],
  },
  {
    x: 8000 - padding,
    y: 4200,
    spaces: ["A4", "A5", "A6"],
    direction: "horizontal",
  },
  {
    x: 1600,
    y: 10000 - height - padding,
    spaces: ["A7", "A8", "A9", "A10", "A11", "A12"],
  },
] as const;

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

  const allSpacesMap = useMemo<Map<string, ParkingSpace>>(() => {
    if (!allSpacesData) return new Map([]);

    return new Map<string, ParkingSpace>(
      allSpacesData.map((space) => [space["parking-space"], space]),
    );
  }, [allSpacesData]);

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

      <div
        style={{
          width: "100%",
          height: 500,
        }}
      >
        <svg
          ref={parkingRef}
          className={styles["svg-container"]}
          style={{
            width: "100%",
            height: "auto",
          }}
          viewBox="0 0 10000 10000"
          preserveAspectRatio="xMidYMid meet"
        >
          <rect
            id="parking-border"
            width="100%"
            height="100%"
            stroke="black"
            fill="#e5e5e5"
            rx={10}
          />

          <svg>
            <rect
              id="gate"
              fill="black"
              rx={8}
              x={0}
              y={5000 - 1200}
              width={200}
              height={4000}
            />

            {pillars.map((pillar) => (
              <rect x={pillar.x} y={pillar.y} width={700} height={700} />
            ))}

            {parkingSpaceRows.map((row, index) => (
              <svg
                style={{
                  width: "100%",
                  height: "auto",
                }}
                x={row.x}
                y={row.y}
              >
                {row.spaces.map((spaceKey, spaceIndex) => {
                  const spaceData = allSpacesMap.get(spaceKey);

                  if (!spaceData) return null;

                  console.log("Row:", row);
                  let x = (width + padding) * spaceIndex;
                  let y = 0;

                  let textX = x + width / 2;
                  let textY = y + height / 2;

                  if (row.direction === "horizontal") {
                    x = 0;
                    y = (width + padding) * spaceIndex;

                    textX = x + height / 2;
                    textY = y + width / 2;
                  }

                  return (
                    <>
                      <rect
                        key={spaceData["parking-space"]}
                        style={{ cursor: "pointer" }}
                        fill="white"
                        stroke="black"
                        x={x}
                        y={y}
                        width={row.direction === "horizontal" ? height : width}
                        height={row.direction == "horizontal" ? width : height}
                        // fill={selected === space.id ? "green" : "gray"}
                        onClick={() => setSelectedSpace(spaceData)}
                      />

                      <text
                        fill="black"
                        fontSize={32 * 10}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        x={x + width / 2}
                        y={y + height / 2}
                      >
                        {spaceData["parking-space"]}
                      </text>
                    </>
                  );
                })}
              </svg>
            ))}
          </svg>
        </svg>
      </div>

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
