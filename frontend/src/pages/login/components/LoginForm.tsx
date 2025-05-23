import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FormEvent, useEffect, useRef, useState } from "react";

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

  const passwordInput = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [passwordSent, setPasswordSent] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  const { mutate: verifyEmail, isPending: isVeryfing } = useVerifyEmail();
  const { mutate: loginMutation, isPending: isLoginPending } = useLogin();

  useEffect(() => {
    if (passwordSent) {
      passwordInput.current?.focus();
    }
  }, [passwordSent]);

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    handleLogin();
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className={styles.container}>
        {error && (
          <div>
            <Message severity="error" text={error} />
          </div>
        )}

        {passwordSent && (
          <Message
            severity="info"
            text="Na twój adres mailowy zostało wysłane jednorazowe hasło. Wprowadź je poniżej"
          />
        )}

        <span className="field">
          <label>Adres email</label>
          <InputText
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
          />
        </span>

        {!passwordSent && (
          <div>
            <Button
              disabled={isVeryfing || email.length === 0}
              onClick={handleSendPassword}
            >
              Wyślij jednorazowe hasło
            </Button>
          </div>
        )}

        {isVeryfing && (
          <div>
            <ProgressSpinner style={{ width: "24px", height: "24px" }} /> Trwa
            wysyłanie maila...
          </div>
        )}

        {passwordSent && (
          <div className={styles.otp}>
            <span className="field">
              <label>Hasło</label>
              <InputText
                ref={passwordInput}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
              />
            </span>

            <Button type="submit" disabled={password.length < 1}>
              Zaloguj
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

export default LoginForm;
