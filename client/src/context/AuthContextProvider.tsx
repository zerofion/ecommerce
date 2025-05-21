import { useState } from "react";
import { AuthProviderProps, ClientRole, initialAuthTemplate, Session } from "./types";
import { useEffect } from "react";
import { getAuth, getRedirectResult } from "@firebase/auth";
import { AuthContext } from "./authContext";
import { updateAuthSessionInLocalStorage, validateAuthSession } from "./authUtils";
import { isMobile } from "../utils/appUtils";
import { signUpWithApp } from "../utils/authApiUtils";

export function AuthProvider({ children }: AuthProviderProps) {
  const persistedAuth = localStorage.getItem('auth');

  const [authSession, setAuthSession] = useState<Session>(persistedAuth ? JSON.parse(persistedAuth) : initialAuthTemplate);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function setRole(role: ClientRole) {
    const updatedAuthSession = {
      token: authSession?.token || null,
      user: {
        role: role,
        email: authSession?.user?.email || null,
        name: authSession?.user?.name || null
      }
    }
    localStorage.setItem('auth', JSON.stringify(updatedAuthSession));
    setAuthSession(updatedAuthSession);
  }

  async function handleRedirect() {
    const result = await getRedirectResult(getAuth());
    if (result) {
      const user = result.user;
      const idToken = await user.getIdToken();

      if (localStorage.getItem('signUp') === 'true') {
        localStorage.removeItem('signUp');
        await signUpWithApp({
          token: idToken,
          user: {
            email: user.email || '',
            role: authSession?.user?.role || ClientRole.CUSTOMER,
            name: user.displayName || '',
          }
        });
      } else {
        const updatedAuthSession = await validateAuthSession({
          idToken: idToken,
          role: authSession?.user?.role || ClientRole.CUSTOMER
        });
        setAuthSession(updatedAuthSession);
      }
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (authSession?.token) {
      validateAuthSession({
        idToken: authSession.token,
        role: authSession.user?.role || ClientRole.CUSTOMER
      });
      setIsLoading(false);
    } else {
      updateAuthSessionInLocalStorage(authSession);
      if (isMobile()) {
        handleRedirect();
        return;
      }
      setIsLoading(false);
    }
  }, [authSession]);

  return (
    <AuthContext.Provider value={{
      authSession, setAuthSession,
      isLoading, setIsLoading, error, setError,
      setRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};
