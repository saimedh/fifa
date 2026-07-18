import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatPanel from '../components/ChatPanel';

// ── Mock the API module ────────────────────────────────────────────────────────
vi.mock('../api', () => ({
  postAssistantQuery: vi.fn(),
  tinyfishSearch: vi.fn(),
}));

import { postAssistantQuery, tinyfishSearch } from '../api';
import type { AssistantResponse } from '../types';

const mockPostAssistantQuery = vi.mocked(postAssistantQuery);
const mockTinyfishSearch = vi.mocked(tinyfishSearch);

// ── Mock GSAP (no-op in tests) ─────────────────────────────────────────────────
vi.mock('gsap', () => ({
  default: {
    registerPlugin: vi.fn(),
    fromTo: vi.fn(),
    to:     vi.fn(),
    timeline: vi.fn(() => ({ fromTo: vi.fn(), defaults: vi.fn() })),
  },
}));
vi.mock('@gsap/react', () => ({
  useGSAP: vi.fn(),
}));

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('ChatPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTinyfishSearch.mockResolvedValue({ query: '', results: [], total_results: 0, page: 1 });
  });

  it('renders the chat input and send button', () => {
    render(<ChatPanel />);
    expect(screen.getByRole('textbox', { name: /type your message/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('renders role, language, zone, and topic selectors', () => {
    render(<ChatPanel />);
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/zone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/topic/i)).toBeInTheDocument();
  });

  it('send button is disabled when input is empty', () => {
    render(<ChatPanel />);
    const btn = screen.getByRole('button', { name: /send message/i });
    expect(btn).toBeDisabled();
  });

  it('submit flow: loading state then success state', async () => {
    const user = userEvent.setup();

    const mockResponse: AssistantResponse = {
      intent:           'navigation',
      reply:            'Head to Gate A via the northern concourse.',
      suggested_action: 'Follow the green signs.',
      language:         'en',
      escalated:        false,
    };

    // Use a controlled promise so we can assert the loading state before it resolves
    let resolveQuery!: (v: AssistantResponse) => void;
    mockPostAssistantQuery.mockImplementation(
      () => new Promise<AssistantResponse>((res) => { resolveQuery = res; })
    );

    render(<ChatPanel />);
    const input = screen.getByRole('textbox', { name: /type your message/i });
    const btn   = screen.getByRole('button', { name: /send message/i });

    await user.type(input, 'Where is Gate A?');
    expect(btn).not.toBeDisabled();

    // Fire click without awaiting all microtasks — keeps us in loading state
    user.click(btn);

    // Loading state: button becomes disabled and aria-busy=true
    await waitFor(() => {
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute('aria-busy', 'true');
    });

    // Resolve the query
    resolveQuery(mockResponse);

    // Success: response renders in the log
    await waitFor(() => {
      expect(screen.getByText('Head to Gate A via the northern concourse.')).toBeInTheDocument();
    });

    // Suggested action shows (icon emoji is a separate text node, use regex)
    expect(screen.getByText(/Follow the green signs\./i)).toBeInTheDocument();

    // Input cleared
    expect(input).toHaveValue('');
  });

  it('submit flow: error state shows error message', async () => {
    const user = userEvent.setup();

    mockPostAssistantQuery.mockRejectedValue({
      detail: 'Rate limit exceeded. Please try again.',
      status: 429,
    });

    render(<ChatPanel />);
    const input = screen.getByRole('textbox', { name: /type your message/i });

    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Rate limit exceeded/i)).toBeInTheDocument();
    });
  });

  it('Enter key sends message, Shift+Enter does not', async () => {
    const user = userEvent.setup();

    const mockResponse: AssistantResponse = {
      intent:           'general',
      reply:            'Thank you for your message.',
      suggested_action: null,
      language:         'en',
      escalated:        false,
    };
    mockPostAssistantQuery.mockResolvedValue(mockResponse);

    render(<ChatPanel />);
    const input = screen.getByRole('textbox', { name: /type your message/i });

    // Shift+Enter should NOT submit
    await user.type(input, 'Hello');
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    expect(mockPostAssistantQuery).not.toHaveBeenCalled();

    // Clear and type again, then Enter without shift
    await user.clear(input);
    await user.type(input, 'Hello');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockPostAssistantQuery).toHaveBeenCalledTimes(1);
    });
  });

  it('chat log has correct ARIA attributes', () => {
    render(<ChatPanel />);
    const log = screen.getByRole('log');
    expect(log).toHaveAttribute('aria-live', 'polite');
    expect(log).toHaveAttribute('aria-label', 'Chat conversation');
  });

  it('escalated messages show escalation notice', async () => {
    const user = userEvent.setup();

    const mockResponse: AssistantResponse = {
      intent:           'emergency',
      reply:            'Emergency services have been notified.',
      suggested_action: null,
      language:         'en',
      escalated:        true,
    };
    mockPostAssistantQuery.mockResolvedValue(mockResponse);

    render(<ChatPanel />);
    const input = screen.getByRole('textbox', { name: /type your message/i });
    await user.type(input, 'Emergency!');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText(/Escalated to staff/i)).toBeInTheDocument();
    });
  });
});
