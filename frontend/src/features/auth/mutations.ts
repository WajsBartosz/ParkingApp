import api from "../../lib/api";

export type VerifyEmailInput = {
  email: string;
};

export type VerifyEmailResult = {};

export async function verifyEmail(
  input: VerifyEmailInput,
): Promise<VerifyEmailResult> {
  const response = await api.post("verify-email", {
    json: {
      email: input.email,
    },
  });

  return response.json();
}

type LoginInput = {
  email: string;
  password: string;
};

type LoginResult = {
  success: true;
  token: string;
  user: any;
};

export async function loginFunction(input: LoginInput): Promise<LoginResult> {
  const response = await api.post("login", {
    json: {
      email: input.email,
      password: input.password,
    },
  });

  return response.json();
}
