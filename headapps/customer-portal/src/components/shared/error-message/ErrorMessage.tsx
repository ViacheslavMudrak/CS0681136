import AlertBox from "@/components/ui/AlertBox";
import React from "react";

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return <AlertBox message={message} variant="error" />;
}
