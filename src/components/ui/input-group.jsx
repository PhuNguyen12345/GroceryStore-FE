import { cloneElement, isValidElement } from "react";

export function InputGroup({ className = "", children, ...props }) {
  return (
    <div className={`position-relative ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function InputGroupInput({ className = "", style, ...props }) {
  return (
    <input
      className={`form-control rounded-3 ${className}`.trim()}
      style={{
        paddingLeft: "2.25rem",
        paddingRight: "0.9rem",
        ...style,
      }}
      {...props}
    />
  );
}

export function InputGroupAddon({ align = "inline-start", className = "", children, ...props }) {
  const isStart = align === "inline-start";

  return (
    <span
      className={`position-absolute top-50 translate-middle-y d-inline-flex align-items-center text-secondary ${className}`.trim()}
      style={{
        left: isStart ? "0.75rem" : "auto",
        right: isStart ? "auto" : "0.75rem",
        pointerEvents: "none",
      }}
      {...props}
    >
      {isValidElement(children) ? cloneElement(children, { size: 16 }) : children}
    </span>
  );
}
