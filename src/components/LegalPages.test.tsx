import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { TermsPage } from './TermsPage';
import { PrivacyPage } from './PrivacyPage';

describe('Turnkey Legal Pages', () => {
  it('renders TermsPage with default sections and brand name', () => {
    render(
      <MemoryRouter>
        <TermsPage brandName="TestFleet" description="cloud operating tools" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Terms of Service' })).toBeDefined();
    expect(screen.getByText(/TestFleet provides cloud operating tools/)).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: 'The service' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: 'Accounts & Security' })).toBeDefined();
  });

  it('renders PrivacyPage with default sections and privacy statement', () => {
    render(
      <MemoryRouter>
        <PrivacyPage brandName="TestFleet" contactEmail="security@testfleet.com" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeDefined();
    expect(screen.getByText(/How TestFleet collects, protects, and handles/)).toBeDefined();
    expect(screen.getByText(/security@testfleet.com/)).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: 'What we collect & store' })).toBeDefined();
  });
});
