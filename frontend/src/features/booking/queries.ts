import { useQuery } from "@tanstack/react-query";
import ky from "ky";

type FetchAvailableSpacesParams = {
  startTime?: string;
  endTime?: string;
};
async function fetchAvailableSpaces(params: FetchAvailableSpacesParams) {
  const url = new URL(`http://localhost:80/get-available-spaces`);

  if (params.startTime) url.searchParams.set("start_time", params.startTime);
  if (params.endTime) url.searchParams.set("end_time", params.endTime);

  const response = await ky.get(url);

  return response.json();
}

export function useAvailableSpaces(params: FetchAvailableSpacesParams) {
  return useQuery({
    queryKey: ["availableSpots"],
    queryFn: ({ queryKey }) => fetchAvailableSpaces(params),
    enabled: !!params.startTime && !!params.endTime,
  });
}
