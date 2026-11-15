interface BrandLogoProps {
  size?: number;
  shape?: 'squircle' | 'circle';
  className?: string;
}

export function BrandLogo({ size = 30, shape = 'squircle', className = '' }: BrandLogoProps) {
  return (
    <span
      aria-hidden="true"
      style={{ fontSize: `${size}px` }}
      className={`brand-logo ${shape === 'circle' ? 'brand-logo--circle' : ''} ${className}`}
    >
      <span className="brand-logo__ring" />
      <span className="brand-logo__stem" />
      <span className="brand-logo__loop" />
      <span className="brand-logo__leg" />
    </span>
  );
}
