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
        src="/brand/expensemargin-rabbit.webp"
        alt=""
        width={40}
        height={40}
        className="brand-rabbit"
        priority={href === "/"}
      />
      {!compact && (
        <span className="brand-wordmark" aria-hidden="true">
          <span>Expense</span><span className="brand-margin">Margin</span>
        </span>
      )}
    </Link>
  );
}
