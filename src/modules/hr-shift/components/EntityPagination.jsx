import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { getPageItems } from "../utils/staffUtils";

export default function EntityPagination({ page, totalPages, onPageChange }) {
	const currentPage = page + 1;
	const pageItems = getPageItems(Math.max(totalPages, 1), currentPage);

	return (
		<div className="admin-pagination mt-4">
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							href="#"
							onClick={(event) => {
								event.preventDefault();
								if (page > 0) onPageChange(page - 1);
							}}
							className={page === 0 ? "pointer-events-none opacity-50" : ""}
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
								if (page < totalPages - 1) onPageChange(page + 1);
							}}
							className={page >= totalPages - 1 || totalPages === 0 ? "pointer-events-none opacity-50" : ""}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
