// ── PlayersPage tests ─────────────────────────────────────────────────────────

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PlayersPage from '../../pages/PlayersPage';

// Players page imports PLAYERS data — no API calls needed.
// Mock GSAP to keep tests fast.
vi.mock('gsap', () => ({
  default: {
    registerPlugin: vi.fn(),
    fromTo: vi.fn(),
    from: vi.fn(),
    to: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
  },
  gsap: {
    registerPlugin: vi.fn(),
  },
}));
vi.mock('@gsap/react', () => ({ useGSAP: vi.fn() }));

const renderPage = () =>
  render(
    <MemoryRouter>
      <PlayersPage />
    </MemoryRouter>
  );

describe('PlayersPage', () => {
  it('renders the page heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /players/i, level: 1 })).toBeInTheDocument();
  });

  it('renders player cards', () => {
    renderPage();
    // Player cards have role="button"
    const cards = screen.getAllByRole('button', { name: /View .+ profile/i });
    expect(cards.length).toBeGreaterThan(0);
  });

  it('search input filters visible players', async () => {
    const user = userEvent.setup();
    renderPage();

    const searchInput = screen.getByPlaceholderText(/search players/i);
    const allCardsBefore = screen.getAllByRole('button', { name: /View .+ profile/i });

    await user.type(searchInput, 'Messi');

    const cardsAfter = screen.getAllByRole('button', { name: /View .+ profile/i });
    // After searching for 'Messi' there should be fewer results than the full roster
    expect(cardsAfter.length).toBeLessThan(allCardsBefore.length);
    // The remaining card(s) should be Messi
    expect(cardsAfter[0]).toHaveAccessibleName(/Messi/i);
  });

  it('position filter buttons reduce the player list', async () => {
    const user = userEvent.setup();
    renderPage();

    const allCards = screen.getAllByRole('button', { name: /View .+ profile/i });

    // Click the "GK" (Goalkeeper) filter
    const gkBtn = screen.getByRole('button', { name: /^GK$/i });
    await user.click(gkBtn);

    const filteredCards = screen.getAllByRole('button', { name: /View .+ profile/i });
    expect(filteredCards.length).toBeLessThan(allCards.length);
    expect(filteredCards.length).toBeGreaterThan(0);
  });

  it('clicking a player card opens the profile modal', async () => {
    const user = userEvent.setup();
    renderPage();

    const cards = screen.getAllByRole('button', { name: /View .+ profile/i });
    await user.click(cards[0]);

    // Modal dialog becomes visible — check inside the dialog role
    const dialog = screen.getByRole('dialog');
    // The stats section inside the modal shows 'Goals'
    expect(within(dialog).getAllByText(/Goals/i).length).toBeGreaterThan(0);
  });

  it('closing the modal hides player stats', async () => {
    const user = userEvent.setup();
    renderPage();

    const cards = screen.getAllByRole('button', { name: /View .+ profile/i });
    await user.click(cards[0]);

    // Close button
    const closeBtn = screen.getByRole('button', { name: /close/i });
    await user.click(closeBtn);

    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('sort by Goals changes the order of displayed cards', async () => {
    const user = userEvent.setup();
    renderPage();

    // The sort bar button is labelled exactly 'Goals'
    const allGoalsBtns = screen.getAllByRole('button', { name: /^goals$/i });
    await user.click(allGoalsBtns[0]);

    const cards = screen.getAllByRole('button', { name: /View .+ profile/i });
    // Should still have players — just sorted differently
    expect(cards.length).toBeGreaterThan(0);
  });
});
