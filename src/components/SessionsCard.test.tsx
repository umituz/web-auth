import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SessionsCard } from './SessionsCard';
import type { ConsentClient, SessionEntry } from '../consent';

const mockSessions: SessionEntry[] = [
  {
    id: 'sess-1',
    token: 'tok-1',
    isCurrent: true,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    ipAddress: '192.168.1.1',
  },
  {
    id: 'sess-2',
    token: 'tok-2',
    isCurrent: false,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    ipAddress: '10.0.0.1',
  },
];

describe('SessionsCard', () => {
  it('loads and renders active sessions', async () => {
    const mockClient: ConsentClient = {
      fetchLatestConsent: vi.fn(),
      recordConsent: vi.fn(),
      fetchActiveSessions: vi.fn().mockResolvedValue({ sessions: mockSessions }),
      revokeSession: vi.fn().mockResolvedValue(undefined),
      revokeOtherSessions: vi.fn().mockResolvedValue(undefined),
    };

    render(<SessionsCard client={mockClient} title="Device Logins" />);

    expect(screen.getByText('Loading sessions…')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('Device Logins')).toBeTruthy();
      expect(screen.getByText('192.168.1.1')).toBeTruthy();
      expect(screen.getByText('10.0.0.1')).toBeTruthy();
    });
  });

  it('revokes a single session', async () => {
    const revokeSession = vi.fn().mockResolvedValue(undefined);
    const mockClient: ConsentClient = {
      fetchLatestConsent: vi.fn(),
      recordConsent: vi.fn(),
      fetchActiveSessions: vi.fn().mockResolvedValue({ sessions: mockSessions }),
      revokeSession,
      revokeOtherSessions: vi.fn().mockResolvedValue(undefined),
    };

    render(<SessionsCard client={mockClient} />);

    await waitFor(() => {
      expect(screen.getByText('10.0.0.1')).toBeTruthy();
    });

    const revokeButtons = screen.getAllByRole('button', { name: /sign out/i });
    const targetBtn = revokeButtons[revokeButtons.length - 1];
    if (targetBtn) {
      fireEvent.click(targetBtn);
    }

    await waitFor(() => {
      expect(revokeSession).toHaveBeenCalledWith('tok-2');
    });
  });
});
