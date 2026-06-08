import Card from "@/components/ui/Card";
import React from "react";

interface AuthCardProps {
  children: React.ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
  return <Card>{children}</Card>;
}
