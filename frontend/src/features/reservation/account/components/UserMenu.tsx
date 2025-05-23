import { LogOut } from "lucide-react";
import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";
import { useRef } from "react";
import useAuth from "../../../auth/hooks";

interface Props {}

function UserMenu({}: Props) {
  const { logout } = useAuth();

  const menu = useRef<TieredMenu>(null);

  return (
    <div>
      <TieredMenu
        ref={menu}
        popup
        model={[
          {
            id: "profile-separator",
            label: "Konto",
            separator: true,
          },
          {
            id: "logout",
            label: "Wyloguj",
            icon: <LogOut style={{ marginRight: 8 }} size={16} />,
            command: () => logout(),
          },
        ]}
      />

      <Button icon="pi pi-bars" onClick={(e) => menu.current?.toggle(e)} />
    </div>
  );
}

export default UserMenu;
