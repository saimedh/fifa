import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OpsDashboard from '../components/OpsDashboard';
import type { CrowdAdvisory } from '../types';

// ── Mock API ───────────────────────────────────────────────────────────────────
vi.mock('../api', () => ({
  postCrowdAdvisory: vi.fn(),
}));

import { postCrowdAdvisory } from '../api';

const mockPostCrowdAdvisory = vi.mocked(postCrowdAdvisory);

// ── Mock GSAP ──────────────────────────────────────────────────────────────────
vi.mock('gsap', () => ({
  default: {
    registerPlugin: vi.fn(),
    fromTo: vi.fn(),
    to:     vi.fn(),
  },
}));
vi.mock('@gsap/react', () => ({
  useGSAP: vi.fn(),
}));

// ── Helpers ────────────────────────────────────────────────────────────────────
function makeAdvisory(zone: string, risk_level: CrowdAdvisory['risk_level']): CrowdAdvisory {
  return {
    zone,
    risk_level,
    summary:             `Zone ${zone} is currently ${risk_level}.`,
    recommended_actions: ['Monitor situation.'],
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('OpsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the API key input gate initially', () => {
    render(<OpsDashboard />);
    expect(screen.getByLabelText(/staff api key/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /access dashboard/i })).toBeInTheDocument();
  });

  it('does not call the API before key is submitted', () => {
    render(<OpsDashboard />);
    expect(mockPostCrowdAdvisory).not.toHaveBeenCalled();
  });

  it('API key is a password input (never exposes the key as plaintext)', () => {
    render(<OpsDashboard />);
    const input = screen.getByLabelText(/staff api key/i);
    expect(input).toHaveAttribute('type', 'password');
  });

  describe('after submitting the API key', () => {
    const ADVISORIES: CrowdAdvisory[] = [
      makeAdvisory('Gate A',            'critical'),
      makeAdvisory('Gate B',            'high'),
      makeAdvisory('Concourse North',   'high'),
      makeAdvisory('Section 1',         'moderate'),
      makeAdvisory('Concourse South',   'low'),
      makeAdvisory('Parking P1',        'low'),
    ];

    async function submitKey() {
      const user = userEvent.setup();
      mockPostCrowdAdvisory.mockImplementation(async (sample) => {
        const idx = ADVISORIES.findIndex((a) => a.zone === sample.zone);
        return ADVISORIES[idx] ?? makeAdvisory(sample.zone, 'low');
      });
      render(<OpsDashboard />);
      const keyInput = screen.getByLabelText(/staff api key/i);
      await user.type(keyInput, 'test-staff-key');
      const submitBtn = screen.getByRole('button', { name: /access dashboard/i });
      await user.click(submitBtn);
    }

    it('shows zone cards after authentication', async () => {
      await submitKey();
      await waitFor(() => {
        expect(screen.getByText('Gate A')).toBeInTheDocument();
      });
    });

    it('renders correct risk badge text for each risk level', async () => {
      await submitKey();

      await waitFor(() => {
        // Critical badge — color + text together
        const criticalBadges = screen.getAllByText('Critical');
        expect(criticalBadges.length).toBeGreaterThan(0);

        // High badge
        const highBadges = screen.getAllByText('High');
        expect(highBadges.length).toBeGreaterThan(0);

        // Moderate badge
        const moderateBadges = screen.getAllByText('Moderate');
        expect(moderateBadges.length).toBeGreaterThan(0);

        // Low badge
        const lowBadges = screen.getAllByText('Low');
        expect(lowBadges.length).toBeGreaterThan(0);
      });
    });

    it('critical zone card has risk-critical CSS class on the badge', async () => {
      await submitKey();

      await waitFor(() => {
        const criticalBadge = screen.getAllByText('Critical')[0].closest('span');
        expect(criticalBadge).toHaveClass('risk-critical');
      });
    });

    it('low zone card has risk-low CSS class on the badge', async () => {
      await submitKey();

      await waitFor(() => {
        const lowBadges = screen.getAllByText('Low');
        const lowBadge  = lowBadges[0].closest('span');
        expect(lowBadge).toHaveClass('risk-low');
      });
    });

    it('high zone card has risk-high CSS class on the badge', async () => {
      await submitKey();

      await waitFor(() => {
        const highBadge = screen.getAllByText('High')[0].closest('span');
        expect(highBadge).toHaveClass('risk-high');
      });
    });

    it('moderate zone card has risk-moderate CSS class on the badge', async () => {
      await submitKey();

      await waitFor(() => {
        const moderateBadge = screen.getAllByText('Moderate')[0].closest('span');
        expect(moderateBadge).toHaveClass('risk-moderate');
      });
    });

    it('sign out button clears the dashboard', async () => {
      const user = userEvent.setup();
      await submitKey();

      await waitFor(() => expect(screen.getByText('Gate A')).toBeInTheDocument());

      const signOutBtn = screen.getByRole('button', { name: /sign out/i });
      await user.click(signOutBtn);

      expect(screen.getByLabelText(/staff api key/i)).toBeInTheDocument();
      expect(screen.queryByText('Gate A')).not.toBeInTheDocument();
    });
  });

  it('shows error when API key is rejected (401)', async () => {
    const user = userEvent.setup();
    mockPostCrowdAdvisory.mockRejectedValue({ detail: 'Invalid API key.', status: 401 });

    render(<OpsDashboard />);
    const keyInput = screen.getByLabelText(/staff api key/i);
    await user.type(keyInput, 'bad-key');
    await user.click(screen.getByRole('button', { name: /access dashboard/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid api key/i)).toBeInTheDocument();
    });
  });
});
