export type LoginData = {
  user: any;
  token: string;
};

export type AuthContextType = {
  user: any;
  login: (data: LoginData) => void;
  logout: () => void;
};
