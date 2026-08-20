import Image from "next/image";
import Link from "next/link";

export function Brand({
  href = "/",
  className = "",
  compact = false,
}: {
  href?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link href={href} className={`brand ${className}`.trim()} aria-label="ExpenseMargin home">
      <Image
        src={compact ? "/brand/expensemargin-icon.png" : "/brand/expensemargin-logo.png"}
        alt="ExpenseMargin"
        width={compact ? 42 : 310}
        height={compact ? 40 : 56}
        className={compact ? "brand-icon" : "brand-logo"}
        priority={href === "/"}
      />
    </Link>
  );
}
