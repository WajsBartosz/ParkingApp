export type ParkingSpace = {
  ID: number;
  "parking-space": string;
};

export type Reservation = {
  ID: number;
  start: string;
  end: string;
  "parking-space": string;
  "confirmed-reservation": 0 | 1;
};
