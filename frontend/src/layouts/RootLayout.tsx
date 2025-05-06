import { Outlet } from "react-router";
import styles from "./RootLayout.module.css";

console.log({ styles });
function RootLayout() {
  return (
    <div>
      <nav className={styles["navbar"]}>
        <ul className={styles["navbar-list"]}>
          <li>
            <a href="/">Strona domowa</a>
          </li>
          <li>
            <a href="/rezerwacja">Rezerwacja</a>
          </li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
}

export default RootLayout;
