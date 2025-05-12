import styles from "./ParkingSpace.module.css";
import { type ParkingSpace } from "../../../features/booking/types";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { useState } from "react";

interface Props {
  space: ParkingSpace;

  disabled?: boolean;
  onClick: () => void;
}

function ParkingSpace({ space, disabled = false, onClick }: Props) {
  console.log(space["parking-space"], " is disabled: ", disabled);

  return (
    <div
      className={styles.container}
      data-disabled={disabled ? "true" : "false"}
      onClick={() => {
        onClick();
      }}
    >
      <p>
        Miejsce <b>{space["parking-space"]}</b>
      </p>

      {disabled && <p>Zarezerwowano</p>}
      {!disabled && <p>Kliknij, żeby zarezerwować</p>}
    </div>
  );
}

export default ParkingSpace;
