export function Field({ className = "", children, ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function FieldLabel({ className = "", children, ...props }) {
  return (
    <label className={`form-label mb-2 ${className}`.trim()} {...props}>
      {children}
    </label>
  );
}

export function FieldDescription({ className = "", children, ...props }) {
  return (
    <small className={`text-secondary d-block mt-1 ${className}`.trim()} {...props}>
      {children}
    </small>
  );
}
