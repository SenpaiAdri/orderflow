export interface CustomerDetails {
  customer: string;
  company: string;
  email: string;
  address: string;
}

export function CustomerFields({
  value,
  onChange,
  autoFocus = false,
}: {
  value: CustomerDetails;
  onChange: (value: CustomerDetails) => void;
  autoFocus?: boolean;
}) {
  const { customer, company, email, address } = value;
  return (
    <>
      <div className="form-grid">
        <label className="field-label">
          Customer name <span>*</span>
          <input
            autoFocus={autoFocus}
            required
            maxLength={80}
            autoComplete="name"
            value={customer}
            onChange={(e) => onChange({ ...value, customer: e.target.value })}
            placeholder="e.g. Isabel Santos"
          />
        </label>
        <label className="field-label">
          Company (optional)
          <input
            maxLength={80}
            value={company}
            onChange={(e) => onChange({ ...value, company: e.target.value })}
            placeholder="Company or business name"
          />
        </label>
      </div>
      <label className="field-label">
        Email address (optional)
        <input
          type="email"
          maxLength={120}
          value={email}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
          placeholder="customer@example.com"
        />
      </label>
      <label className="field-label">
        Delivery address <span>*</span>
        <input
          required
          maxLength={250}
          value={address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          placeholder="Street, city, province"
        />
      </label>
    </>
  );
}
