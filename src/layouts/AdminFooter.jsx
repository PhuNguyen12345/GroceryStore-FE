import { Container, Row, Col } from "react-bootstrap";

export default function AdminFooter() {
  return (
    <footer className="admin-footer py-3">
      <Container fluid>
        <Row className="align-items-center">
          <Col md={6}>
            <small className="text-muted">© 2026 GroceryStore Admin. All rights reserved.</small>
          </Col>
          <Col md={6} className="text-md-end">
            <small className="text-muted">Version 1.1 | Last updated: 13/03/2026</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
