import { AuthLayout } from "./AuthLayout";
import type { AuthConfig, Translate } from "../types/auth";

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalDoc {
  title: string;
  intro?: string;
  sections: LegalSection[];
  updated?: string;
}

export interface LegalPageProps {
  config: AuthConfig;
  doc: LegalDoc;
  translate?: Translate;
}

export const LegalPage = ({ config, doc, translate }: LegalPageProps) => (
  <AuthLayout config={{ ...config, brandTagline: undefined }} translate={translate}>
    <article className="uauth-legal">
      <h1 className="uauth-legal__title">{doc.title}</h1>
      {doc.intro && <p className="uauth-legal__intro">{doc.intro}</p>}
      {doc.sections.map((section) => (
        <section key={section.heading} className="uauth-legal__section">
          <h2 className="uauth-legal__heading">{section.heading}</h2>
          <p className="uauth-legal__body">{section.body}</p>
        </section>
      ))}
      {doc.updated && <p className="uauth-legal__updated">{doc.updated}</p>}
    </article>
  </AuthLayout>
);

export default LegalPage;
