import { Outlet } from "react-router";

import "../global.css";
import styles from "./RootLayout.module.css";

function RootLayout() {
  return (
    <div className={styles.container}>
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

      <div className={styles["page-content"]}>
        <Outlet />
      </div>
    </div>
  );
}

export default RootLayout;
