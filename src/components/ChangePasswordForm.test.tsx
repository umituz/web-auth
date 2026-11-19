import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ChangePasswordForm, type ChangePasswordFormProps } from './ChangePasswordForm';

const mount = (props: Partial<ChangePasswordFormProps> = {}) =>
  render(
    <ChangePasswordForm
      onSubmit={vi.fn().mockResolvedValue(undefined)}
      {...props}
    />,
  );

const submitForm = () => {
  const btn = screen.getByRole('button', { name: /update password/i });
  fireEvent.submit(btn.closest('form')!);
};

describe('ChangePasswordForm', () => {
  it('renders current, new and confirm password fields', () => {
    mount();
    expect(screen.getByLabelText(/current password/i)).toBeTruthy();
    expect(screen.getByLabelText(/^new password/i)).toBeTruthy();
    expect(screen.getByLabelText(/confirm new password/i)).toBeTruthy();
  });

  it('validates missing current password', async () => {
    mount();
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: 'NewP@ssw0rd1' },
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'NewP@ssw0rd1' },
    });
    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/current password is required/i)).toBeTruthy();
    });
  });

  it('validates password mismatch', async () => {
    mount();
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'OldP@ssw0rd1' },
    });
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: 'NewP@ssw0rd1' },
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'DifferentP@ssw0rd2' },
    });
    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeTruthy();
    });
  });

  it('submits valid payload and displays success message', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onSuccess = vi.fn();
    mount({ onSubmit, onSuccess });

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'OldP@ssw0rd1' },
    });
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: 'NewP@ssw0rd1' },
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'NewP@ssw0rd1' },
    });
    submitForm();

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        currentPassword: 'OldP@ssw0rd1',
        newPassword: 'NewP@ssw0rd1',
        revokeOtherSessions: true,
      });
      expect(onSuccess).toHaveBeenCalled();
      expect(screen.getByText(/password updated successfully/i)).toBeTruthy();
    });
  });
});
