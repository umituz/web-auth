import { LegalPage, type LegalDoc, type LegalSection } from './LegalPage';
import { DEFAULT_TERMS_VERSION } from '../consent';
import type { AuthConfig, Translate } from '../types/auth';

export interface PrivacyPageProps {
  brandName: string;
  config?: Partial<AuthConfig>;
  contactEmail?: string;
  description?: string;
  termsVersion?: string;
  sections?: LegalSection[];
  translate?: Translate;
}

export function PrivacyPage({
  brandName,
  config,
  contactEmail = 'privacy@example.com',
  description,
  termsVersion = DEFAULT_TERMS_VERSION,
  sections,
  translate,
}: PrivacyPageProps) {
  const fullConfig: AuthConfig = {
    brandName,
    homeRoute: '/',
    loginRoute: '/login',
    registerRoute: '/login',
    afterLoginRoute: '/',
    afterLogoutRoute: '/',
    termsRoute: '/terms',
    privacyRoute: '/privacy',
    ...(config ?? {}),
  };

  const defaultSections: LegalSection[] = [
    {
      heading: 'What we collect & store',
      body: 'Account credentials (name, email), authentication sessions, organization settings, and the business records your team enters into the workspace.',
    },
    {
      heading: 'How information is used',
      body: `Data is used solely to provide and operate ${brandName} — multi-tenant data isolation, notifications, operational workflows, and audit logging. We do not sell or monetize personal or business data.`,
    },
    {
      heading: 'Data security & Isolation',
      body: 'Your organization’s records are strictly isolated using database-level access controls and encrypted network connections. Multi-tenant boundaries prevent cross-tenant access.',
    },
    {
      heading: 'Retention & Deletion',
      body: `Organization administrators can export or delete records. Account deletion removes credentials and session tokens from ${brandName}. For privacy inquiries or deletion requests, contact ${contactEmail}.`,
    },
  ];

  const doc: LegalDoc = {
    title: 'Privacy Policy',
    intro: description ?? `How ${brandName} collects, protects, and handles organization and account data.`,
    sections: sections ?? defaultSections,
    updated: `Last updated: ${termsVersion}`,
  };

  return <LegalPage config={fullConfig} doc={doc} translate={translate} />;
}
