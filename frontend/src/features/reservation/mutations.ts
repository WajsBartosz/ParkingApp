import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";

type BookParkingSpaceInput = {
  parkingSpace: string;
  startTime: Date;
};

type BookParkingSpaceResult = {
  success: boolean;
  message: string;
};

async function bookParkingSpace(
  input: BookParkingSpaceInput,
): Promise<BookParkingSpaceResult> {
  const response = await api.post("reservations", {
    json: {
      parkingSpot: input.parkingSpace,
      startTime: input.startTime,
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
      queryClient.invalidateQueries({
        queryKey: ["activeReservation"],
      });
    },
  });
}
