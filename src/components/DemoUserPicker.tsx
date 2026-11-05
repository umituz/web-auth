import { Avatar } from "@umituz/web-design-system/molecules";
import { Button } from "@umituz/web-design-system/atoms";
import { groupDemoUsers } from "../utils/auth";
import type { DemoUserPickerProps } from "../types/auth";

export const DemoUserPicker = ({ users, groups, onPick }: DemoUserPickerProps) => {
  const visible = groupDemoUsers(users, groups);

  return (
    <>
      {visible.map((group) => (
        <section key={group.id} className="uauth-demo-section">
          <h2 className="uauth-demo-title">{group.title}</h2>
          <div className="uauth-demo-users">
            {group.users.map((user) => (
              <Button
                key={user.id}
                type="button"
                variant="secondary"
                className="uauth-demo-user"
                onClick={() => void onPick(user.id)}
              >
                <Avatar name={user.name} size="sm" />
                <span className="uauth-demo-user-text">
                  <b className="uauth-demo-user-name">{user.name}</b>
                  <span className="uauth-demo-user-meta">
                    {group.roleLabels?.[user.role] ?? user.role}
                  </span>
                </span>
              </Button>
            ))}
          </div>
        </section>
      ))}
    </>
  );
};

export default DemoUserPicker;
