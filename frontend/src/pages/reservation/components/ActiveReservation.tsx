import { useActiveReservation } from "../../../features/reservation/queries";

interface Props {}

function ActiveReservation({}: Props) {
  const { data } = useActiveReservation();

  return <></>;
}

export default ActiveReservation;
