import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccessibilityForm from '../components/AccessibilityForm';

// ── Mock API ───────────────────────────────────────────────────────────────────
vi.mock('../api', () => ({
  postAccessibilityRequest: vi.fn(),
}));

import { postAccessibilityRequest } from '../api';
import type { AccessibilityTicket } from '../types';

const mockPost = vi.mocked(postAccessibilityRequest);

// ── Mock react-hot-toast (avoid portal issues in jsdom) ───────────────────────
vi.mock('react-hot-toast', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-hot-toast')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      custom: vi.fn(),
    },
    Toaster: () => null,
  };
});

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('AccessibilityForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<AccessibilityForm />);
    expect(screen.getByLabelText(/your zone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/additional details/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contact info/i)).toBeInTheDocument();
  });

  it('submit button is present', () => {
    render(<AccessibilityForm />);
    expect(screen.getByRole('button', { name: /request assistance/i })).toBeInTheDocument();
  });

  it('blocks submit when zone is empty', async () => {
    const user = userEvent.setup();
    render(<AccessibilityForm />);

    const contact = screen.getByLabelText(/contact info/i);
    await user.type(contact, '+1-555-1234');

    const submitBtn = screen.getByRole('button', { name: /request assistance/i });
    await user.click(submitBtn);

    // API should NOT have been called
    expect(mockPost).not.toHaveBeenCalled();

    // Error message shown for zone
    await waitFor(() => {
      expect(screen.getByText(/please select your zone/i)).toBeInTheDocument();
    });
  });

  it('blocks submit when contact is empty', async () => {
    const user = userEvent.setup();
    render(<AccessibilityForm />);

    const zoneSelect = screen.getByLabelText(/your zone/i);
    await user.selectOptions(zoneSelect, 'Gate A');

    const submitBtn = screen.getByRole('button', { name: /request assistance/i });
    await user.click(submitBtn);

    expect(mockPost).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText(/contact information is required/i)).toBeInTheDocument();
    });
  });

  it('blocks submit when both zone and contact are empty', async () => {
    const user = userEvent.setup();
    render(<AccessibilityForm />);

    const submitBtn = screen.getByRole('button', { name: /request assistance/i });
    await user.click(submitBtn);

    expect(mockPost).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText(/please select your zone/i)).toBeInTheDocument();
    });
  });

  it('succeeds and resets form when zone and contact provided', async () => {
    const user = userEvent.setup();

    const mockTicket: AccessibilityTicket = {
      ticket_id:   'TKT-12345',
      status:      'open',
      eta_minutes: 5,
    };
    mockPost.mockResolvedValue(mockTicket);

    render(<AccessibilityForm />);

    const zoneSelect = screen.getByLabelText(/your zone/i);
    await user.selectOptions(zoneSelect, 'Gate A');

    const contact = screen.getByLabelText(/contact info/i);
    await user.type(contact, '+1-555-9876');

    const submitBtn = screen.getByRole('button', { name: /request assistance/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith({
        kind:    'wheelchair',
        zone:    'Gate A',
        details: '',
        contact: '+1-555-9876',
      });
    });

    // Form should reset
    await waitFor(() => {
      expect((screen.getByLabelText(/your zone/i) as HTMLSelectElement).value).toBe('');
    });
  });

  it('zone field has aria-required and aria-invalid when error', async () => {
    const user = userEvent.setup();
    render(<AccessibilityForm />);

    const submitBtn = screen.getByRole('button', { name: /request assistance/i });
    await user.click(submitBtn);

    const zoneSelect = screen.getByLabelText(/your zone/i);
    await waitFor(() => {
      expect(zoneSelect).toHaveAttribute('aria-required', 'true');
      expect(zoneSelect).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('kind selector buttons have aria-pressed', () => {
    render(<AccessibilityForm />);
    // Label was shortened to 'Wheelchair' in the redesigned icon-card selector
    const wheelchairBtn = screen.getByRole('button', { name: /^wheelchair$/i });
    expect(wheelchairBtn).toHaveAttribute('aria-pressed', 'true'); // default
  });
});
