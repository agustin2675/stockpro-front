import { createContext, useState, ReactNode } from "react";
import { role } from "../ROLE";

const defaultAuthContext = {
  auth: { profileMode: role.guest },
  handleProfileMode: () => {},
};

export const AuthContext = createContext(defaultAuthContext);

export const ContextProvider = ({ children }) => {
  const profileMode = localStorage.getItem("profileMode") || role.guest;

  const [auth, setAuth] = useState({ profileMode: profileMode });

  const handleProfileMode = (mode) => {
    if (mode) {
      localStorage.setItem("profileMode", mode);
      setAuth({ ...auth, profileMode: mode });
    }
  };

  return (
    <AuthContext.Provider value={{ auth, handleProfileMode }}>
      {children}
    </AuthContext.Provider>
  );
};