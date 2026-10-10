import type { LinkProps } from "react-router-dom";
import { Link } from "react-router-dom";
import { buttonClassNames, type ButtonSize, type ButtonVariant } from "@/components/ui/buttonStyles";

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClassNames(
        variant,
        size,
        `hover:-translate-y-px active:scale-[.98] ${className ?? ""}`
      )}
      {...props}
    />
  );
}
