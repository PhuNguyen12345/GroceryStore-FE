import * as React from "react";
import { FaChevronLeft, FaChevronRight, FaEllipsisH } from "react-icons/fa";
import { cn } from "@/lib/utils";

function Pagination({ className, ...props }) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }) {
  return <ul className={cn("flex flex-row items-center gap-1", className)} {...props} />;
}

function PaginationItem({ ...props }) {
  return <li {...props} />;
}

function PaginationLink({ className, isActive, ...props }) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-3 text-sm transition-colors no-underline",
        isActive
          ? "border-emerald-600 bg-emerald-600 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        className
      )}
      {...props}
    />
  );
}

function PaginationPrevious({ className, ...props }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn("gap-1 pl-2.5", className)}
      {...props}
    >
      <FaChevronLeft size={10} />
      <span>Trước</span>
    </PaginationLink>
  );
}

function PaginationNext({ className, ...props }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn("gap-1 pr-2.5", className)}
      {...props}
    >
      <span>Sau</span>
      <FaChevronRight size={10} />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex h-8 w-8 items-center justify-center text-slate-500", className)}
      {...props}
    >
      <FaEllipsisH size={12} />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
