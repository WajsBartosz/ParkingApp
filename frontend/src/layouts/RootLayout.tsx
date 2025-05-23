import { Outlet } from "react-router";

import "../global.css";
import "primeicons/primeicons.css";

import styles from "./RootLayout.module.css";
import useAuth from "../features/auth/hooks";
import UserMenu from "../features/reservation/account/components/UserMenu";
import { Chip } from "primereact/chip";

function RootLayout() {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <nav className={styles["navbar"]}>
        <h1>ParkingApp</h1>

        <ul className={styles["navbar-list"]}>
          {/* <li> */}
          {/*   <a className={styles["nav-link"]} href="/"> */}
          {/*     <div className=" pi pi-car"></div> */}
          {/*     Rezerwacja */}
          {/*   </a> */}
          {/* </li> */}

          <li className={styles["account-info"]}>
            <div>
              {!user && <span>Niezalogowano</span>}

              {user && (
                <div className={styles["user-data"]}>
                  <Chip label={user.email} icon="pi pi-user"></Chip>
                  <UserMenu />
                </div>
              )}
            </div>
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
