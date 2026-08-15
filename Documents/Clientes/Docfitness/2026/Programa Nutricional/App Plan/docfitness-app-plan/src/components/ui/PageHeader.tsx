export default function PageHeader({ title, subtitle, titleClassName }) {
  return (
    <div className="mb-6">
      <div className={"premium-page-title " + (titleClassName || '')}>{title}</div>
      {subtitle && <div className="premium-subtitle">{subtitle}</div>}
    </div>
  );
}
