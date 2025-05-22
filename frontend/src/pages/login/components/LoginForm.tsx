import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useState } from "react";

import styles from "./LoginForm.module.css";
import { Message } from "primereact/message";
import useAuth, {
  useLogin,
  useVerifyEmail,
} from "../../../features/auth/hooks";
import { ProgressSpinner } from "primereact/progressspinner";
import { HTTPError } from "ky";

function LoginForm() {
  const { login } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [passwordSent, setPasswordSent] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  const { mutate: verifyEmail, isPending: isVeryfing } = useVerifyEmail();
  const { mutate: loginMutation, isPending: isLoginPending } = useLogin();

  function handleSendPassword() {
    setError(undefined);

    verifyEmail(
      {
        email,
      },
      {
        onError: async (error) => {
          if (error instanceof HTTPError) {
            const body = await error.response.json();

            setError(body.detail);
          }
        },
        onSuccess: () => {
          setPasswordSent(true);
        },
      },
    );
  }

  function handleLogin() {
    setError(undefined);

    loginMutation(
      {
        email,
        password,
      },
      {
        onError: async (error) => {
          if (error instanceof HTTPError) {
            const body = await error.response.json();

            setError(body.detail);
          }
        },
        onSuccess: (data) => {
          login({
            user: data.user,
            token: data.token,
          });
        },
      },
    );
  }

  return (
    <div>
      <div className={styles.container}>
        {error && (
          <div>
            <Message severity="error" text={error} />
          </div>
        )}

        <span className="field">
          <label>Adres email</label>
          <InputText
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
          />
        </span>

        {!passwordSent && (
          <Button
            disabled={isVeryfing || email.length === 0}
            onClick={handleSendPassword}
          >
            Wyślij jednorazowe hasło
          </Button>
        )}

        {isVeryfing && (
          <div>
            <ProgressSpinner /> Trwa wysyłanie maila...
          </div>
        )}

        {passwordSent && (
          <div className={styles.otp}>
            <Message
              severity="info"
              text="Na twój adres mailowy zostało wysłane jednorazowe hasło. Wprowadź je poniżej"
            />

            <span className="field">
              <label>Jednorazowe hasło</label>
              <InputText
                type="password"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
              />
            </span>

            <Button disabled={password.length < 1} onClick={handleLogin}>
              Zaloguj
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginForm;
