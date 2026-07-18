import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import BrandLogo from '../components/BrandLogo';

describe('BrandLogo', () => {
  it('renders correctly', () => {
    const { container } = render(<BrandLogo size={50} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '50');
    expect(svg).toHaveAttribute('height', '50');
  });

  it('uses default size of 32', () => {
    const { container } = render(<BrandLogo />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '36');
    expect(svg).toHaveAttribute('height', '36');
  });
});
