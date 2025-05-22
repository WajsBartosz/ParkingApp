import { ReactNode } from "react";
import useAuth from "./hooks";
import { Navigate } from "react-router";

interface Props {
  children: ReactNode;
}
function ProtectedRoute({ children }: Props) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
