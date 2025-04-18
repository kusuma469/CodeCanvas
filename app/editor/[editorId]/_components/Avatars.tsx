import { useOthers, useSelf } from "@liveblocks/react/suspense";
import styles from "./Avatars.module.css";

export function Avatars() {
  const users = useOthers();
  const currentUser = useSelf();

  return (
    <div className={styles.avatars}>
      {users.map(({ connectionId, info }) => {
        return (
          <Avatar 
             key={connectionId} 
             picture={info.picture || "/default-avatar.png"} 
             name={info.name} />
        );
      })}
      {currentUser && (
        <div className="relative ml-8 first:ml-0">
          <Avatar
            picture={currentUser.info.picture || "/default-avatar.png"}
            name={currentUser.info.name}
          />
        </div>
      )}
    </div>
  );
}

export function Avatar({ picture, name }: { picture: string; name: string }) {
  return (
    <div className={styles.avatar} data-tooltip={name}>
      <img
        src={picture}
        className={styles.avatar_picture}
        data-tooltip={name}
        alt={name}
      />
    </div>
  );
}