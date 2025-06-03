import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Check for trial user in localStorage as a fallback authentication method
  const trialEmail = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('trial_user_email');
  }, []);

  // Consider user authenticated if they have an active trial or are logged in
  const isAuthenticated = !!user || !!trialEmail;

  return {
    user: user || (trialEmail ? { email: trialEmail } : null),
    isLoading,
    isAuthenticated,
  };
}