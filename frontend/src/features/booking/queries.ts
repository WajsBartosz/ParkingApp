import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import ky from "ky";
import { ParkingSpace } from "./types";

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

  console.log(searchParams.toString());
  const response = await api.get(
    "get-available-spaces?" + searchParams.toString(),
  );

  return response.json();
}

export function useAvailableSpaces(params: FetchAvailableSpacesParams) {
  console.log("params:", params);

  const isEnabled = !!params.startTime && !!params.endTime;

  console.log({ isEnabled });
  return useQuery({
    queryKey: ["availableSpots"],
    queryFn: ({ queryKey }) => fetchAvailableSpaces(params),
    enabled: !!params.startTime && !!params.endTime,
  });
}
