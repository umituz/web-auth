import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ActiveSessionsList, type ActiveSession } from './ActiveSessionsList';

const sampleSessions: ActiveSession[] = [
  {
    id: 's-1',
    isCurrent: true,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    ipAddress: '192.168.1.1',
    createdAt: Date.now() - 3600000,
  },
  {
    id: 's-2',
    isCurrent: false,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
    ipAddress: '10.0.0.1',
    createdAt: Date.now() - 86400000,
  },
];

describe('ActiveSessionsList', () => {
  it('renders current and other sessions', () => {
    render(<ActiveSessionsList sessions={sampleSessions} />);
    expect(screen.getByText(/active sessions/i)).toBeTruthy();
    expect(screen.getByText(/current device/i)).toBeTruthy();
    expect(screen.getByText('192.168.1.1')).toBeTruthy();
    expect(screen.getByText('10.0.0.1')).toBeTruthy();
  });

  it('triggers onRevokeSession when clicking revoke on non-current session', () => {
    const onRevokeSession = vi.fn().mockResolvedValue(undefined);
    render(
      <ActiveSessionsList
        sessions={sampleSessions}
        onRevokeSession={onRevokeSession}
      />,
    );

    const revokeButtons = screen.getAllByRole('button', { name: /sign out/i });
    expect(revokeButtons.length).toBeGreaterThan(0);
    const targetBtn = revokeButtons[revokeButtons.length - 1];
    if (targetBtn) {
      fireEvent.click(targetBtn);
    }
    expect(onRevokeSession).toHaveBeenCalledWith('s-2');
  });

  it('triggers onRevokeOtherSessions when clicking revoke all button', () => {
    const onRevokeOtherSessions = vi.fn().mockResolvedValue(undefined);
    render(
      <ActiveSessionsList
        sessions={sampleSessions}
        onRevokeOtherSessions={onRevokeOtherSessions}
      />,
    );

    const revokeAllBtn = screen.getByRole('button', { name: /sign out of all other devices/i });
    fireEvent.click(revokeAllBtn);
    expect(onRevokeOtherSessions).toHaveBeenCalled();
  });
});
