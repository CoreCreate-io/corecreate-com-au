import { Container } from "./container";
import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return <Container>{children}</Container>;
}