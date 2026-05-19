import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { BackButton } from "./BackButton";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  showBack?: boolean;
  backTo?: string;
}

const NO_BACK_PATHS = ["/", "/dashboard"];

export function PageWrapper({ children, className, showBack = true, backTo }: PageWrapperProps) {
  const { pathname } = useLocation();
  const displayBack = showBack && !NO_BACK_PATHS.includes(pathname);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn("relative", className)}
    >
      {displayBack && (
        <div className="fixed top-[4.5rem] right-4 sm:right-5 lg:right-6 z-30">
          <BackButton to={backTo} />
        </div>
      )}
      {children}
    </motion.div>
  );
}
