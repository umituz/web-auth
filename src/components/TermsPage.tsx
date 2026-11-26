import { LegalPage, type LegalDoc, type LegalSection } from './LegalPage';
import { DEFAULT_TERMS_VERSION } from '../consent';
import type { AuthConfig, Translate } from '../types/auth';

export interface TermsPageProps {
  brandName: string;
  config?: Partial<AuthConfig>;
  description?: string;
  contactEmail?: string;
  termsVersion?: string;
  sections?: LegalSection[];
  translate?: Translate;
}

export function TermsPage({
  brandName,
  config,
  description = 'platform and workspace services',
  contactEmail = 'support@example.com',
  termsVersion = DEFAULT_TERMS_VERSION,
  sections,
  translate,
}: TermsPageProps) {
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
      heading: 'The service',
      body: `${brandName} provides ${description}. Workspace records and reports guide operational decisions; verify figures before committing them externally.`,
    },
    {
      heading: 'Accounts & Security',
      body: 'Accounts belong to the organization that invited them. Keep credentials secure and confidential; all activity in the workspace is attributed to your account.',
    },
    {
      heading: 'Workspace records & Ownership',
      body: 'All records, data, and assets entered into the platform remain the property of your organization. You agree to keep them accurate and compliant with applicable regulations.',
    },
    {
      heading: 'Acceptable use',
      body: 'Use the platform only for legitimate business and operational purposes. Do not attempt to compromise security, access unauthorized data, or disrupt service integrity.',
    },
    {
      heading: 'Revisions & Modifications',
      body: `These terms may change as ${brandName} evolves. Material changes will be presented for confirmation with an updated version stamp (${termsVersion}). For questions, contact ${contactEmail}.`,
    },
  ];

  const doc: LegalDoc = {
    title: 'Terms of Service',
    intro: `These terms govern access to and use of ${brandName}.`,
    sections: sections ?? defaultSections,
    updated: `Last updated: ${termsVersion}`,
  };

  return <LegalPage config={fullConfig} doc={doc} translate={translate} />;
}
