import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiClient } from "@/lib/api-client";
import LoadingPage from "../Loading";

const withAuth = (WrappedComponent: React.ComponentType) => {
  const AuthenticatedComponent: React.FC = (props) => {
    const { token, setEmail, setRoleId } = useAuthStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkToken = async () => {
        if (!token) {
          router.replace("/");
          return;
        }

        try {
          console.log("Checking token...");
          const response = await apiClient.get("/user/get_user_me");

          const userData = response.data;
          setEmail(userData.Email);
          setRoleId(userData.RoleID);
        } catch (error) {
          console.error("Token validation failed:", error);
          router.replace("/");
        } finally {
          setIsLoading(false);
        }
      };

      checkToken();
    }, [token, setEmail, setRoleId, router]);

    if (isLoading) {
      return <LoadingPage />;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthenticatedComponent;
};

export default withAuth;