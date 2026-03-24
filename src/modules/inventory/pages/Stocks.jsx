import { useMemo, useState } from "react";
import { Alert, Badge, Card, Container, Form, Table } from "react-bootstrap";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { inventoryService } from "@/core/api/inventoryService";

function emptyCheckItem() {
  return { productUnitId: "", requestedQuantity: "" };
}

export default function StockPage() {
  const [singleQuery, setSingleQuery] = useState({ warehouseId: "", productUnitId: "" });
  const [singleResult, setSingleResult] = useState(null);

  const [checkForm, setCheckForm] = useState({ warehouseId: "", items: [emptyCheckItem()] });
  const [checkResult, setCheckResult] = useState(null);

  const [loadingSingle, setLoadingSingle] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [error, setError] = useState("");

  const canRunSingle = useMemo(() => Number(singleQuery.warehouseId) > 0 && Number(singleQuery.productUnitId) > 0, [singleQuery]);

  const runSingle = async (event) => {
    event.preventDefault();
    if (!canRunSingle) {
      setError("Cần nhập đầy đủ ID kho và ID đơn vị sản phẩm");
      return;
    }

    try {
      setLoadingSingle(true);
      setError("");
      const qty = await inventoryService.getAvailableStock(Number(singleQuery.productUnitId), Number(singleQuery.warehouseId));
      setSingleResult(qty);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Không thể kiểm tra tồn kho theo đơn vị");
    } finally {
      setLoadingSingle(false);
    }
  };

  const updateCheckItem = (index, key, value) => {
    setCheckForm((prev) => ({ ...prev, items: prev.items.map((item, idx) => (idx === index ? { ...item, [key]: value } : item)) }));
  };

  const addCheckItem = () => setCheckForm((prev) => ({ ...prev, items: [...prev.items, emptyCheckItem()] }));
  const removeCheckItem = (index) => setCheckForm((prev) => ({ ...prev, items: prev.items.filter((_, idx) => idx !== index) }));

  const runCheck = async (event) => {
    event.preventDefault();
    const warehouseId = Number(checkForm.warehouseId);
    const items = checkForm.items
      .map((item) => ({ productUnitId: Number(item.productUnitId), requestedQuantity: Number(item.requestedQuantity) }))
      .filter((item) => item.productUnitId > 0 && item.requestedQuantity > 0);

    if (!warehouseId || items.length === 0) {
      setError("Cần nhập ID kho và ít nhất một dòng hợp lệ");
      return;
    }

    try {
      setLoadingCheck(true);
      setError("");
      const response = await inventoryService.checkStock({ warehouseId, items });
      setCheckResult(response);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Không thể kiểm tra tồn kho giỏ hàng");
    } finally {
      setLoadingCheck(false);
    }
  };

  return (
    <AdminLayout>
      <Container fluid>
        <div className="admin-page-heading mb-4">
          <div className="admin-page-heading-text">
            <h2 className="fw-bold mb-1">Kho - Tồn kho</h2>
            <p className="text-muted mb-0">Kiểm tra tồn kho theo đơn vị và theo giỏ hàng.</p>
          </div>
        </div>

        {error ? <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert> : null}

        <div className="row g-4">
          <div className="col-12 col-xl-5">
            <Card className="admin-panel border-0 h-100">
              <Card.Header className="bg-white border-0"><h6 className="mb-0 fw-semibold">Tồn kho theo đơn vị sản phẩm</h6></Card.Header>
              <Card.Body>
                <Form onSubmit={runSingle} className="d-grid gap-3">
                  <Form.Group><Form.Label>ID kho</Form.Label><Form.Control type="number" min={1} value={singleQuery.warehouseId} onChange={(e) => setSingleQuery((p) => ({ ...p, warehouseId: e.target.value }))} /></Form.Group>
                  <Form.Group><Form.Label>ID đơn vị sản phẩm</Form.Label><Form.Control type="number" min={1} value={singleQuery.productUnitId} onChange={(e) => setSingleQuery((p) => ({ ...p, productUnitId: e.target.value }))} /></Form.Group>
                  <Button type="submit" disabled={loadingSingle}>{loadingSingle ? "Đang kiểm tra..." : "Kiểm tra tồn"}</Button>
                </Form>
                {singleResult !== null ? (<Alert variant="info" className="mt-3 mb-0">Số lượng còn: <strong>{singleResult}</strong></Alert>) : null}
              </Card.Body>
            </Card>
          </div>

          <div className="col-12 col-xl-7">
            <Card className="admin-panel border-0 h-100">
              <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-semibold">Kiểm tra tồn kho giỏ hàng</h6>
                <Button type="button" variant="outline" onClick={addCheckItem}>Thêm dòng</Button>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={runCheck}>
                  <Form.Group className="mb-3"><Form.Label>ID kho</Form.Label><Form.Control type="number" min={1} value={checkForm.warehouseId} onChange={(e) => setCheckForm((p) => ({ ...p, warehouseId: e.target.value }))} /></Form.Group>
                  <div className="d-grid gap-2 mb-3">
                    {checkForm.items.map((item, index) => (
                      <div key={index} className="d-flex gap-2">
                        <Form.Control type="number" min={1} placeholder="ID đơn vị SP" value={item.productUnitId} onChange={(e) => updateCheckItem(index, "productUnitId", e.target.value)} />
                        <Form.Control type="number" min={1} placeholder="Số lượng yêu cầu" value={item.requestedQuantity} onChange={(e) => updateCheckItem(index, "requestedQuantity", e.target.value)} />
                        <Button type="button" variant="destructive" onClick={() => removeCheckItem(index)} disabled={checkForm.items.length <= 1}>Xóa</Button>
                      </div>
                    ))}
                  </div>
                  <Button type="submit" disabled={loadingCheck}>{loadingCheck ? "Đang kiểm tra..." : "Kiểm tra giỏ"}</Button>
                </Form>

                {checkResult ? (
                  <div className="mt-3">
                    <Alert variant={checkResult.isAllAvailable ? "success" : "warning"}>Kết quả: {checkResult.isAllAvailable ? "Đủ hàng toàn bộ" : "Có mặt hàng thiếu tồn"}</Alert>
                    <div className="table-responsive">
                      <Table hover className="align-middle mb-0 admin-brand-table">
                        <thead><tr><th>ID đơn vị SP</th><th>Sản phẩm</th><th>Đơn vị</th><th>Yêu cầu</th><th>Khả dụng</th><th>Trạng thái</th></tr></thead>
                        <tbody>
                          {(checkResult.itemStatuses || []).map((row, index) => (
                            <tr key={`${row.productUnitId}-${index}`}>
                              <td>{row.productUnitId}</td><td>{row.productName || "-"}</td><td>{row.unitName || "-"}</td><td>{row.requestedQuantity}</td><td>{row.availableQuantity}</td>
                              <td><Badge bg={row.hasEnough ? "success" : "danger"}>{row.hasEnough ? "Đủ" : "Thiếu"}</Badge></td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                ) : null}
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    </AdminLayout>
  );
}
