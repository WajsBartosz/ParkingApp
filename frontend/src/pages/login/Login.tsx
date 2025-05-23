import LoginForm from "./components/LoginForm";
import styles from "./Login.module.css";

function LoginPage() {
  return (
    <main className={styles["page-content"]}>
      <div className={styles.container}>
        <h1>Logowanie</h1>
        <LoginForm />
      </div>

      <p className={` info-text ${styles.copyright}`}>
        &copy; 2025 ParkingApp{" "}
      </p>
    </main>
  );
}

export default LoginPage;
