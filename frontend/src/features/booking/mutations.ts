import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import { format } from "date-fns";

type BookParkingSpaceInput = {
  parkingSpace: string;
  startTime: Date;
  endTime: Date;
};

type BookParkingSpaceResult = {};

async function bookParkingSpace(
  input: BookParkingSpaceInput,
): Promise<BookParkingSpaceResult> {
  const startTime = format(input.startTime, "yyyy-MM-dd HH:MM:SS");
  const endTime = format(input.endTime, "yyyy-MM-dd HH:MM:SS");

  const response = await api.post("make-reservation", {
    json: {
      parkingSpot: input.parkingSpace,
      startTime,
      endTime,
    },
  });

  return response.json();
}

export function useBookParkingSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookParkingSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["availableSpaces"],
      });
    },
  });
}
