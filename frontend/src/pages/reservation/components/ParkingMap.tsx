import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAllSpaces,
  useAvailableSpaces,
  useReservations,
} from "../../../features/reservation/queries";
import useReservationContext from "../providers/ReservationProvider/hooks";
import styles from "./ParkingMap.module.css";
import ReservationSidebar from "./ReservationSidebar";
import { ParkingSpace } from "../../../features/reservation/types";

const ICON_BLUE = "var(--parking-icon)";
const ROAD_MARK = "white";
const PLACE_VACANT = "var(--place-vacant)";
const PLACE_RESERVED = "";

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

  const { data: reservationsData, isFetching: isFetchingReservations } =
    useReservations();

  const allSpacesMap = useMemo<Map<string, ParkingSpace>>(() => {
    if (!allSpacesData) return new Map([]);

    console.log("all spaces:", allSpacesData);
    return new Map<string, ParkingSpace>(
      allSpacesData.map((space) => [space["parking-space"], space]),
    );
  }, [allSpacesData]);

  useEffect(() => {
    console.log({ allSpacesData });
  }, [allSpacesData]);

  useEffect(() => {
    console.log({ reservationsData });
  }, [reservationsData]);

  const [reservedSpaces, takenSpaces] = useMemo<
    [Set<string>, Set<string>]
  >(() => {
    const reservedSpaces = new Set<string>();
    const takenSpaces = new Set<string>();

    if (reservationsData) {
      for (const reservation of reservationsData.reservations) {
        if (reservation["confirmed-reservation"]) {
          takenSpaces.add(reservation["parking-space"]);
        } else {
          reservedSpaces.add(reservation["parking-space"]);
        }
      }
    }

    return [reservedSpaces, takenSpaces];
  }, [reservationsData]);

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

            <rect
              id="elevator"
              fill="black"
              rx={8}
              x={10000 - 200}
              y={1600}
              width={200}
              height={1800}
            />

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="56em"
              height="56em"
              x={7900}
              y={2000}
              opacity="50%"
            >
              <path
                fill={ICON_BLUE}
                d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2M8.5 6a1.25 1.25 0 1 1 0 2.5a1.25 1.25 0 0 1 0-2.5m2.5 8h-1v4H7v-4H6v-2.5c0-1.1.9-2 2-2h1c1.1 0 2 .9 2 2zm4.5 3L13 13h5zM13 11l2.5-4l2.5 4z"
              ></path>
            </svg>

            <defs>
              <pattern
                id="pillar-stripes"
                patternUnits="userSpaceOnUse"
                width="80"
                height="80"
                patternTransform="rotate(45)"
              >
                <rect x="0" y="0" width="40" height="80" fill="#e2e2e2" />
                <rect x="40" y="0" width="40" height="80" fill="#afafaf" />
              </pattern>
            </defs>

            <defs>
              <pattern
                id="danger-stripes"
                patternUnits="userSpaceOnUse"
                width="80"
                height="80"
                patternTransform="rotate(45)"
              >
                <rect x="0" y="0" width="40" height="80" fill="#545454" />
                <rect x="40" y="0" width="40" height="80" fill="#beb130" />
              </pattern>
            </defs>

            {pillars.map((pillar) => (
              <>
                <rect
                  rx={100}
                  x={pillar.x}
                  y={pillar.y}
                  width={700}
                  height={700}
                  fill="url(#pillar-stripes)"
                />
              </>
            ))}

            <rect
              rx={100}
              x={10000 - 900 - 300}
              y={1500}
              width={900}
              height={2000}
              opacity="65%"
              fill="url(#danger-stripes)"
            />

            {parkingSpaceRows.map((row, index) => (
              <svg
                style={{
                  width: "100%",
                  height: "auto",
                }}
                x={row.x}
                y={row.y}
                stroke="grey"
                strokeWidth={8}
              >
                {row.spaces.map((spaceKey, spaceIndex) => {
                  const spaceData = allSpacesMap.get(spaceKey);

                  if (!spaceData) return null;

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

                  let isDisabled = false;
                  let className = styles["space-vacant"];

                  if (selectedSpace?.ID === spaceData.ID) {
                    className = styles["space-vacant-active"];
                  } else if (reservedSpaces.has(spaceData["parking-space"])) {
                    isDisabled = true;
                    className = styles["space-reserved"];
                  } else if (takenSpaces.has(spaceData["parking-space"])) {
                    isDisabled = true;
                    className = styles["space-taken"];
                  }

                  return (
                    <>
                      <rect
                        key={spaceData["parking-space"]}
                        className={className}
                        rx={100}
                        stroke="grey"
                        strokeWidth="12"
                        x={x}
                        y={y}
                        width={row.direction === "horizontal" ? height : width}
                        height={row.direction == "horizontal" ? width : height}
                        onClick={() => {
                          if (isDisabled) {
                            return;
                          }

                          setSelectedSpace(spaceData);
                        }}
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
