import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { ParkingSpace, Reservation } from "./types";

type FetchActiveReservationResult = {
  success: true;
  reservation: Reservation;
};

async function fetchActiveReservation(): Promise<FetchActiveReservationResult> {
  const response = await api.get("reservations/active");

  return response.json();
}

export function useActiveReservation() {
  return useQuery({
    queryKey: ["activeReservation"],
    queryFn: fetchActiveReservation,
  });
}

type FetchAllSpacesResult = ParkingSpace[];

async function fetchAllSpaces(): Promise<FetchAllSpacesResult> {
  const response = await api.get("parking-spaces");

  return response.json();
}

export function useAllSpaces() {
  return useQuery({
    queryKey: ["fetchAllSpaces"],
    queryFn: fetchAllSpaces,
  });
}

type FetchAvailableSpacesParams = {
  startTime?: string;
  endTime?: string;
};

type FetchAvailableSpacesResult = ParkingSpace[];

async function fetchAvailableSpaces(
  params: FetchAvailableSpacesParams,
): Promise<FetchAvailableSpacesResult> {
  const searchParams = new URLSearchParams();

  if (params.startTime) searchParams.set("startTime", params.startTime);
  if (params.endTime) searchParams.set("endTime", params.endTime);

  // console.log(searchParams.toString());
  const response = await api.get(
    "get-available-spaces?" + searchParams.toString(),
  );

  return response.json();
}

export function useAvailableSpaces(params: FetchAvailableSpacesParams) {
  return useQuery({
    queryKey: ["availableSpaces"],
    queryFn: () => fetchAvailableSpaces(params),
    enabled: !!params.startTime && !!params.endTime,
  });
}

export type FetchReservationsParams = {
  startTime?: string;
  endTime?: string;
};

export type FetchReservationsResult = {
  success: true;
  reservations: Reservation[];
};

async function fetchReservations(): Promise<FetchReservationsResult> {
  const response = await api.get("reservations");

  return response.json();
}

export function useReservations() {
  return useQuery({
    queryKey: ["reservations"],
    queryFn: fetchReservations,
  });
}
