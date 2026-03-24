import ProductItem from "./ProductItem";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function getPageItems(total, current) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [1];
  if (current > 3) pages.push("ellipsis-left");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("ellipsis-right");
  pages.push(total);
  return pages;
}

const ProductGrid = ({ products, onAdd, page, totalPages, onPageChange }) => {
  const currentPage = Number(page || 0) + 1;
  const pageCount = Math.max(Number(totalPages || 0), 1);
  const pageItems = getPageItems(pageCount, currentPage);

  return (
    <div className="flex flex-col gap-3">
      {products.map((p) => (
        <ProductItem key={p.id} product={p} onAdd={onAdd} />
      ))}

      <div className="admin-pagination mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 2);
                }}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {pageItems.map((item) => (
              <PaginationItem key={item}>
                {typeof item === "number" ? (
                  <PaginationLink
                    href="#"
                    isActive={item === currentPage}
                    onClick={(event) => {
                      event.preventDefault();
                      onPageChange(item - 1);
                    }}
                  >
                    {item}
                  </PaginationLink>
                ) : (
                  <PaginationEllipsis />
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (currentPage < pageCount) onPageChange(currentPage);
                }}
                className={currentPage >= pageCount ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default ProductGrid;
