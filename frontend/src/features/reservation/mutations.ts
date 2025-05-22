import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";

type BookParkingSpaceInput = {
  parkingSpace: string;
  startTime: Date;
  endTime: Date;
};

type BookParkingSpaceResult = {
  success: boolean;
  message: string;
};

async function bookParkingSpace(
  input: BookParkingSpaceInput,
): Promise<BookParkingSpaceResult> {
  const response = await api.post("make-reservation", {
    json: {
      parkingSpot: input.parkingSpace,
      startTime: input.startTime,
      endTime: input.startTime,
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
        queryKey: ["reservations"],
      });
    },
  });
}
