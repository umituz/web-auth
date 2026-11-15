import { Navigate } from "react-router";

export interface AuthRedirectProps {
  when: boolean;
  to: string;
}

export const AuthRedirect = ({ when, to }: AuthRedirectProps) => {
  if (!when) return null;
  return <Navigate to={to} replace />;
};

export default AuthRedirect;
