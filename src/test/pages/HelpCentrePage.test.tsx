// ── HelpCentrePage tests ──────────────────────────────────────────────────────

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import HelpCentrePage from '../../pages/HelpCentrePage';

vi.mock('@gsap/react', () => ({ useGSAP: vi.fn() }));
vi.mock('gsap', () => ({
  default: { registerPlugin: vi.fn(), from: vi.fn(), to: vi.fn() },
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <HelpCentrePage />
    </MemoryRouter>
  );

describe('HelpCentrePage', () => {
  it('renders the page heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /help centre/i, level: 1 })).toBeInTheDocument();
  });

  it('renders a search input', () => {
    renderPage();
    expect(screen.getByPlaceholderText(/search help articles/i)).toBeInTheDocument();
  });

  it('renders the section filter tabs (General, Tickets, At The Venue, AI Assistant)', () => {
    renderPage();
    // Each category name may appear in both a sidebar filter and a chip/badge;
    // use getAllByRole and confirm at least one button exists for each.
    expect(screen.getAllByRole('button', { name: /General/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /^Tickets$/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /At The Venue/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /AI Assistant/i }).length).toBeGreaterThan(0);
  });

  it('shows General FAQs by default', () => {
    renderPage();
    expect(screen.getByText(/What is Stadium Copilot\?/i)).toBeInTheDocument();
  });

  it('accordion item expands on click and shows answer', async () => {
    const user = userEvent.setup();
    renderPage();

    const questionBtn = screen.getByRole('button', { name: /What is Stadium Copilot\?/i });
    expect(questionBtn).toHaveAttribute('aria-expanded', 'false');

    await user.click(questionBtn);

    expect(questionBtn).toHaveAttribute('aria-expanded', 'true');
    // The answer should now be visible
    expect(screen.getByText(/official AI-powered operations/i)).toBeInTheDocument();
  });

  it('accordion item collapses on second click', async () => {
    const user = userEvent.setup();
    renderPage();

    const questionBtn = screen.getByRole('button', { name: /What is Stadium Copilot\?/i });
    await user.click(questionBtn);
    await user.click(questionBtn);

    expect(questionBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/official AI-powered operations/i)).not.toBeInTheDocument();
  });

  it('clicking the Tickets tab shows ticket FAQs', async () => {
    const user = userEvent.setup();
    renderPage();

    // Click the first Tickets filter tab (may be multiple matches due to FAQ content)
    const ticketsBtns = screen.getAllByRole('button', { name: /^Tickets$/i });
    await user.click(ticketsBtns[0]);

    expect(screen.getByText(/I lost my digital ticket/i)).toBeInTheDocument();
  });

  it('search filters FAQs across all sections', async () => {
    const user = userEvent.setup();
    renderPage();

    const searchInput = screen.getByPlaceholderText(/search help articles/i);
    await user.type(searchInput, 'WiFi');

    // The WiFi question lives in "At The Venue" section
    expect(screen.getByText(/Is there WiFi inside the stadium\?/i)).toBeInTheDocument();
    // Result count text should appear
    expect(screen.getByText(/result/i)).toBeInTheDocument();
  });

  it('search with no matches shows empty state', async () => {
    const user = userEvent.setup();
    renderPage();

    const searchInput = screen.getByPlaceholderText(/search help articles/i);
    await user.type(searchInput, 'zxzxzxzxzxzx_no_match');

    expect(screen.getByText(/0 result/i)).toBeInTheDocument();
  });
});
