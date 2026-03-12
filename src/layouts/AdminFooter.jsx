import { Container, Row, Col } from "react-bootstrap";

export default function AdminFooter() {
  return (
    <footer className="border-top bg-light text-muted py-3 mt-5">
      <Container fluid>
        <Row className="align-items-center">
          <Col md={6}>
            <small>© 2026 GroceryStore Admin. All rights reserved.</small>
          </Col>
          <Col md={6} className="text-md-end">
            <small>Version 1.0 | Last updated: 11/03/2026</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
