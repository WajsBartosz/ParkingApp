import { createContext, ReactNode } from "react";
import { AuthContextType, LoginData } from "./types";
import { useNavigate } from "react-router";
import useLocalStorage from "../../hooks/useLocalStorage";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface Props {
  children: ReactNode;
}

function AuthProvider({ children }: Props) {
  const [user, setUser] = useLocalStorage("user", null);
  const navigate = useNavigate();

  const login = (data: LoginData) => {
    localStorage.setItem("token", data.token);
    setUser(data.user);

    navigate("/rezerwacja");
  };

  const logout = () => {};

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export default AuthProvider;
