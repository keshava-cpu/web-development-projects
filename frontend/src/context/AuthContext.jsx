import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { loginUser } from '../api/auth';

const AuthContext = createContext(null);

const readStoredUser = () => {
  const raw = localStorage.getItem('rnd_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('rnd_token'));
  const [user, setUser] = useState(readStoredUser);

  const login = useCallback(async (email, password) => {
    // loginUser returns the parsed response body directly (not an axios response object)
    // Backend response shape: { message: string, data: { token, user } }
    const responseBody = await loginUser({ email, password });
    const nextToken = responseBody.data?.token ?? responseBody.token;
    const nextUser = responseBody.data?.user ?? responseBody.user;

    localStorage.setItem('rnd_token', nextToken);
    localStorage.setItem('rnd_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);

    return responseBody;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('rnd_token');
    localStorage.removeItem('rnd_user');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
