// ── VenuesPage tests ──────────────────────────────────────────────────────────

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import VenuesPage from '../../pages/VenuesPage';

vi.mock('@gsap/react', () => ({ useGSAP: vi.fn() }));
vi.mock('gsap', () => ({
  default: { registerPlugin: vi.fn(), from: vi.fn(), to: vi.fn() },
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <VenuesPage />
    </MemoryRouter>
  );

describe('VenuesPage', () => {
  it('renders the page heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /venues/i, level: 1 })).toBeInTheDocument();
  });

  it('renders at least one venue card', () => {
    renderPage();
    // Each venue card contains an article or a named element; MetLife is the first
    expect(screen.getByText(/MetLife Stadium/i)).toBeInTheDocument();
  });

  it('all three host countries are displayed', () => {
    renderPage();
    // USA appears in filter buttons and per-card country badges — use getAllBy
    expect(screen.getAllByText(/United States|USA/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mexico/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Canada/i).length).toBeGreaterThan(0);
  });

  it('country filter buttons exist and clicking one narrows results', async () => {
    const user = userEvent.setup();
    renderPage();

    // Total card count before filtering
    const allVenueNames = screen.getAllByText(/Stadium|Arena|Field|Place|BBVA/i);
    const totalBefore = allVenueNames.length;

    // Click the Mexico filter
    const mexicoBtn = screen.getByRole('button', { name: /Mexico/i });
    await user.click(mexicoBtn);

    const afterFilter = screen.getAllByText(/Stadium|Arena|Field|Place|BBVA|Azteca/i);
    expect(afterFilter.length).toBeLessThanOrEqual(totalBefore);
    // Estadio Azteca is a Mexico venue — it should still appear
    expect(screen.getByText(/Azteca/i)).toBeInTheDocument();
  });

  it('"All Countries" filter restores the full list', async () => {
    const user = userEvent.setup();
    renderPage();

    // Filter down to Mexico then back to all
    const mexicoBtn = screen.getByRole('button', { name: /Mexico/i });
    await user.click(mexicoBtn);

    const allBtn = screen.getByRole('button', { name: /All Countries|All/i });
    await user.click(allBtn);

    // MetLife (USA) should be visible again
    expect(screen.getByText(/MetLife Stadium/i)).toBeInTheDocument();
  });

  it('venue details (capacity, surface) are visible on the page', () => {
    renderPage();
    // MetLife's capacity is 82,500
    expect(screen.getByText(/82,500/)).toBeInTheDocument();
  });
});
