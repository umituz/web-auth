import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { DeleteAccountDialog, type DeleteAccountDialogProps } from './DeleteAccountDialog';

const mount = (props: Partial<DeleteAccountDialogProps> = {}) =>
  render(
    <DeleteAccountDialog
      isOpen={true}
      onClose={vi.fn()}
      onConfirm={vi.fn().mockResolvedValue(undefined)}
      {...props}
    />,
  );

describe('DeleteAccountDialog', () => {
  it('does not render when isOpen is false', () => {
    mount({ isOpen: false });
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('renders title, warning and buttons when open', () => {
    mount();
    expect(screen.getByRole('alertdialog')).toBeTruthy();
    expect(screen.getByText(/permanently delete account/i)).toBeTruthy();
    expect(screen.getByText(/cancel/i)).toBeTruthy();
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    mount({ onConfirm });
    fireEvent.click(screen.getByRole('button', { name: /permanently delete account/i }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('enforces confirmation word when requireConfirmationWord is true', () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    mount({
      onConfirm,
      requireConfirmationWord: true,
      confirmationWord: 'DELETE',
    });

    const confirmBtn = screen.getByRole('button', { name: /permanently delete account/i }) as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(true);

    fireEvent.change(screen.getByPlaceholderText('DELETE'), {
      target: { value: 'DELETE' },
    });
    expect(confirmBtn.disabled).toBe(false);

    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalled();
  });
});
