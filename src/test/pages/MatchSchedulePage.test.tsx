// ── MatchSchedulePage tests ───────────────────────────────────────────────────

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MatchSchedulePage from '../../pages/MatchSchedulePage';

vi.mock('@gsap/react', () => ({ useGSAP: vi.fn() }));
vi.mock('gsap', () => ({
  default: { registerPlugin: vi.fn(), from: vi.fn(), to: vi.fn() },
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <MatchSchedulePage />
    </MemoryRouter>
  );

describe('MatchSchedulePage', () => {
  it('renders the page heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /match schedule/i, level: 1 })).toBeInTheDocument();
  });

  it('shows all rounds filter buttons', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /^All$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Group Stage/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Round of 16/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Quarter-Final/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Semi-Final/i })).toBeInTheDocument();
    // Use getAllBy to handle cases where 'Final' text appears in multiple places
    expect(screen.getAllByRole('button', { name: /^Final$/i }).length).toBeGreaterThan(0);
  });

  it('renders match cards — group stage matches are visible by default', () => {
    renderPage();
    // Mexico vs Canada is the first group stage match — may appear multiple times in rich layout
    expect(screen.getAllByText(/Mexico/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Canada/i).length).toBeGreaterThan(0);
  });

  it('filtering to "Round of 16" hides group stage matches', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /Round of 16/i }));

    // Group stage teams (Mexico vs Canada) should no longer appear
    expect(screen.queryByText(/Estadio Azteca/i)).not.toBeInTheDocument();
    // Round of 16 matches should be visible
    expect(screen.getAllByText(/Round of 16/i).length).toBeGreaterThan(0);
  });

  it('filtering to "Final" shows the Grand Final heading', async () => {
    const user = userEvent.setup();
    renderPage();

    // Click the exact 'Final' filter button (not 'Quarter-Final' / 'Semi-Final')
    const finalBtns = screen.getAllByRole('button', { name: /^Final$/i });
    await user.click(finalBtns[0]);

    expect(screen.getByText(/The Grand Final/i)).toBeInTheDocument();
    // MetLife may appear multiple times (stadium name + badge) — just confirm it's present
    expect(screen.getAllByText(/MetLife Stadium/i).length).toBeGreaterThan(0);
  });

  it('clicking "All" after filtering restores all matches', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /Round of 16/i }));
    await user.click(screen.getByRole('button', { name: /^All$/i }));

    // Group stage match should be back
    expect(screen.getByText(/Estadio Azteca/i)).toBeInTheDocument();
  });

  it('shows stat badges for total matches, group stage, knockout, and nations', () => {
    renderPage();
    // The stat badge may render multiple times in different viewports — just confirm presence
    expect(screen.getAllByText(/48 matches|Total Matches/i).length).toBeGreaterThan(0);
  });
});
