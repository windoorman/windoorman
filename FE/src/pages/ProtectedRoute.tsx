import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import useUserStore from "../stores/useUserStore";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const accessToken = useUserStore.getState().accessToken;

  if (!accessToken) {
    // accessToken이 없으면 로그인 페이지로 리디렉션
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>; // 자식 요소를 반환
};

export default ProtectedRoute;
