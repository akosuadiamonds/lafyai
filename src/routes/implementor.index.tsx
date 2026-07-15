import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/implementor/")({
  beforeLoad: () => {
    throw redirect({ to: "/implementor/dashboard" });
  },
});