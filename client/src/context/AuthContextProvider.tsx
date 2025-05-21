import { useState } from "react";
import { AuthProviderProps, ClientRole, initialAuthTemplate, Session } from "./types";
import { useEffect } from "react";
import { getAuth, getRedirectResult } from "@firebase/auth";
import { AuthContext } from "./authContext";
import { handleError, updateAuthSessionInLocalStorage, validateAuthSession } from "./authUtils";
import { isMobile } from "../utils/appUtils";
import { signUpWithApp } from "../utils/authApiUtils";
import { useNavigate } from "react-router-dom";

export function AuthProvider({ children }: AuthProviderProps) {
  const persistedAuth = localStorage.getItem('auth');

  const [authSession, setAuthSession] = useState<Session>(persistedAuth ? JSON.parse(persistedAuth) : initialAuthTemplate);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
        try {
          await signUpWithApp({
            token: idToken,
            user: {
              email: user.email || '',
              role: authSession?.user?.role || ClientRole.CUSTOMER,
              name: user.displayName || '',
            }
          });
          navigate('/auth/login?ujc=1');
        } catch (error: any) {
          setIsLoading(false);
          console.error(error);
          handleError(error, navigate);
        }
      } else {
        try {
          const updatedAuthSession = await validateAuthSession({
            idToken: idToken,
            role: authSession?.user?.role || ClientRole.CUSTOMER
          });
          setAuthSession(updatedAuthSession);
          navigate('/');
        } catch (error: any) {
          setIsLoading(false);
          console.error(error);
          handleError(error, navigate);
        }
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
