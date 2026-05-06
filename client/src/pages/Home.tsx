import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Home page - redirects to dashboard
 */
export default function Home() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/");
  }, [setLocation]);

  return null;
}
