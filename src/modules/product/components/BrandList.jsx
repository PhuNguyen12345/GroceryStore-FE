import { useState, useEffect } from "react";
import { Table, Button, Badge, Spinner, Alert } from "react-bootstrap";
import { FaEdit, FaTrash, FaUndo } from "react-icons/fa";

export default function BrandList({ brands, loading, onEdit, onDelete, onRestore, onLoadMore }) {
  return (
    <div>
      {loading && brands.length === 0 && (
        <div className="text-center py-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
        </div>
      )}

      {brands.length === 0 && !loading && (
        <Alert variant="info">Chưa có thương hiệu nào</Alert>
      )}

      {brands.length > 0 && (
        <Table responsive hover className="mb-0 align-middle">
          <thead className="bg-light text-muted">
            <tr>
              <th className="fw-semibold border-0 py-3 ps-4">ID</th>
              <th className="fw-semibold border-0 py-3">Tên</th>
              <th className="fw-semibold border-0 py-3">Mô tả</th>
              <th className="fw-semibold border-0 py-3">Trạng thái</th>
              <th className="fw-semibold border-0 py-3">Ngày tạo</th>
              <th className="fw-semibold border-0 py-3 text-end pe-4" style={{ minWidth: "120px" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.id} className="border-bottom">
                <td className="ps-4 text-muted">#{brand.id}</td>
                <td className="fw-medium text-dark">{brand.name}</td>
                <td className="text-secondary">{brand.description?.substring(0, 50) || "Không có mô tả"}...</td>
                <td>
                  <Badge 
                    bg={brand.isActive ? "success" : "secondary"} 
                    pill 
                    className={`bg-opacity-10 text-${brand.isActive ? "success" : "secondary"} border border-${brand.isActive ? "success" : "secondary"}`}
                  >
                    {brand.isActive ? "Kích hoạt" : "Tắt"}
                  </Badge>
                </td>
                <td className="text-muted">{new Date(brand.createdAt).toLocaleDateString("vi-VN")}</td>
                <td className="pe-4">
                  <div className="d-flex gap-2 justify-content-end">
                    <Button
                      variant="light"
                      className="text-primary shadow-sm border-0"
                      size="sm"
                      onClick={() => onEdit(brand)}
                      title="Sửa"
                    >
                      <FaEdit />
                    </Button>
                    {brand.isActive ? (
                      <Button
                        variant="light"
                        className="text-danger shadow-sm border-0"
                        size="sm"
                        onClick={() => onDelete(brand.id)}
                        title="Xóa"
                      >
                        <FaTrash />
                      </Button>
                    ) : (
                      <Button
                        variant="light"
                        className="text-warning shadow-sm border-0"
                        size="sm"
                        onClick={() => onRestore(brand.id)}
                        title="Khôi phục"
                      >
                        <FaUndo />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
