import { IconPlug, IconShield } from "../icons";
import { DocSection, MiniCard, Step, ListPoint, Faq, Code } from "./components";
import CodeBlockHighlighted from "./CodeBlock";
import CodeTabs from "./CodeTabs";
import Playground from "./Playground";
import { API_SNIPPETS } from "./apiSnippets";
import type { NavGroup } from "./content.fr";

export const NAV: NavGroup[] = [
  {
    title: "Getting started",
    items: [
      { href: "#demarrage", label: "Quick start" },
      { href: "#comptes-gmail", label: "Connect Gmail" },
    ],
  },
  {
    title: "Templates",
    items: [
      { href: "#templates", label: "Create a template" },
      { href: "#ia", label: "AI generation" },
    ],
  },
  {
    title: "Sending",
    items: [
      { href: "#envoi", label: "Single & bulk sending" },
      { href: "#historique", label: "History" },
    ],
  },
  {
    title: "Developers",
    items: [{ href: "#api", label: "Email Service & API" }],
  },
  {
    title: "Account",
    items: [
      { href: "#compte", label: "My account" },
      { href: "#admin", label: "Administration" },
    ],
  },
  {
    title: "Help",
    items: [{ href: "#faq", label: "FAQ" }],
  },
];

export const strings = {
  docsBadge: "Docs",
  readyTitle: "Ready to send your first email?",
  openEmailGo: "Open EmailGo",
};

export default function DocsContent() {
  return (
    <>
      <DocSection id="demarrage" eyebrow="Getting started" title="Quick start">
        <p>
          It all starts with one account: sign in to EmailGo with Google, then connect one or more Gmail accounts
          that will actually send your emails. You&apos;ll be ready to reach out in just a few minutes.
        </p>
        <ol className="mt-4 flex flex-col gap-3">
          <Step n={1} title="Sign in to the platform">
            From <Code>/login</Code>, sign in with Google. Your EmailGo account is created automatically on first
            sign-in.
          </Step>
          <Step n={2} title="Connect a sending Gmail account">
            From <Code>/connect</Code>, add the Gmail account that will actually send your emails — it can be
            different from the account you signed in with.
          </Step>
          <Step n={3} title="Create your first template">
            Write it yourself or let the AI draft one, with variables to personalize each send.
          </Step>
          <Step n={4} title="Send">
            A single recipient, a pasted list, or a whole CSV file — it&apos;s up to you.
          </Step>
        </ol>
      </DocSection>

      <DocSection id="comptes-gmail" eyebrow="Getting started" title="Connect Gmail accounts">
        <p>
          From <Code>/connect</Code>, two ways to connect a sending Gmail account, whichever suits you best:
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <MiniCard icon={IconPlug} title="Automatic (OAuth)">
            The simplest option: sign in with Google, EmailGo handles the rest. Ideal if you want to avoid any
            password handling.
          </MiniCard>
          <MiniCard icon={IconShield} title="Manual (app password)">
            Enable 2-step verification on the Google account, generate a dedicated app password, and paste it into
            the form.
          </MiniCard>
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          Credentials (OAuth refresh token or app password) are encrypted before storage — never kept in plain text.
        </p>
      </DocSection>

      <DocSection id="templates" eyebrow="Templates" title="Create a template">
        <p>
          A template is a name, a subject and a body — with variables in the <Code>{"{{variable}}"}</Code> format
          (e.g. <Code>{"{{prenom}}"}</Code>, <Code>{"{{entreprise}}"}</Code>) that get replaced at send time, per
          recipient.
        </p>
        <ul className="mt-4 flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <ListPoint>
            <strong className="text-foreground">Two editing modes</strong> — a visual editor (bold, italics, lists,
            links) or raw HTML with syntax highlighting, for full control over formatting.
          </ListPoint>
          <ListPoint>
            <strong className="text-foreground">Desktop / Mobile preview</strong> — see the real rendering before
            sending, in an isolated frame that faithfully reproduces what the recipient will see.
          </ListPoint>
          <ListPoint>
            <strong className="text-foreground">Test send</strong> — from the template&apos;s <Code>Test</Code> tab,
            send yourself a version with variable values of your choice before using it for real.
          </ListPoint>
        </ul>
      </DocSection>

      <DocSection id="ia" eyebrow="Templates" title="AI generation">
        <p>
          Don&apos;t feel like starting from a blank page? From the template editor, click{" "}
          <Code>Generate with AI</Code>, describe the email you want in a sentence (context, tone, goal), pick the
          format — text or HTML — and get a complete draft back, variables included.
        </p>
        <p className="mt-3">
          You stay in control: the generated draft is fully editable, both in the visual editor and as HTML.
        </p>
      </DocSection>

      <DocSection id="envoi" eyebrow="Sending" title="Single & bulk sending">
        <p>
          From <Code>/send</Code>, pick a Gmail account and a template, then send in three ways:
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <MiniCard title="Single recipient">Enter an address, fill in the variables, send.</MiniCard>
          <MiniCard title="Pasted list">
            Paste a list of addresses (comma or newline separated) for a batch send.
          </MiniCard>
          <MiniCard title="CSV import">
            Import a file with one column per variable — each row becomes a personalized send.
          </MiniCard>
        </div>
      </DocSection>

      <DocSection id="historique" eyebrow="Sending" title="History">
        <p>
          Every send — successful or failed — is logged in <Code>/history</Code>, with the recipient, the account
          used, the template, and the failure reason if any. Filter by status to quickly spot what needs retrying.
        </p>
      </DocSection>

      <DocSection id="api" eyebrow="Developers" title="Email Service & API">
        <p>
          From <Code>/account</Code>, generate an API key (format <Code>eg_…</Code>, shown in full only once) to
          send emails from your own applications, without going through the interface.
        </p>

        <h3 className="mt-6 mb-2 text-sm font-semibold text-foreground">Authentication</h3>
        <p>Send your key in the header of every request:</p>
        <CodeBlockHighlighted lang="bash" code={`Authorization: Bearer eg_xxxxxxxxxxxxxxxxxxxxxxxx`} />

        <h3 className="mt-6 mb-2 text-sm font-semibold text-foreground">Services</h3>
        <p>
          Before sending, create a <strong className="text-foreground">service</strong> from{" "}
          <Code>/email-service</Code>: a name, an identifier (<Code>serviceId</Code>, pre-filled and editable), and a
          connected Gmail account. The service already carries the sending account — the API only ever needs its
          identifier, never a raw Gmail account ID.
        </p>

        <h3 className="mt-6 mb-2 text-sm font-semibold text-foreground">Endpoint</h3>
        <CodeBlockHighlighted lang="bash" code={`POST /api/v1/send`} />

        <div className="mt-6 mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Example</h3>
          <Playground />
        </div>
        <CodeTabs snippets={API_SNIPPETS} />
        <p className="mt-3 text-sm text-zinc-500">
          Response: <Code>{'{ "success": true }'}</Code> or <Code>{'{ "error": "..." }'}</Code> with a matching HTTP
          status code. The service must belong to the same account as the API key used.
        </p>
      </DocSection>

      <DocSection id="compte" eyebrow="Account" title="My account">
        <p>
          From <Code>/account</Code>: account info, stats (active Gmail accounts, templates, emails sent), any
          sending limit, API key management, and sign out.
        </p>
      </DocSection>

      <DocSection id="admin" eyebrow="Account" title="Administration">
        <p>
          Reserved for the address set as administrator. From <Code>/admin</Code> (unlocked with a dedicated
          password): platform-wide stats, user management — banning, disabling, or limiting sends (per day, week, or
          month).
        </p>
      </DocSection>

      <DocSection id="faq" eyebrow="Help" title="Frequently asked questions">
        <div className="flex flex-col gap-5">
          <Faq q="Does the account sending emails need to be the same as my login account?">
            No. Your login account is your identity on EmailGo; the Gmail accounts connected in{" "}
            <Code>/connect</Code> are the ones that actually send, and can be different.
          </Faq>
          <Faq q="What happens if I go over my sending limit?">
            If a limit has been set for your account, sends are blocked with a clear message until the rolling
            window (day, week, or month) frees up.
          </Faq>
          <Faq q="Can I edit a template generated by the AI?">
            Yes, fully — the generated text is just a starting point, editable in both the visual editor and HTML.
          </Faq>
          <Faq q="Are my Gmail credentials safe?">
            Secrets (OAuth refresh token, app password) are encrypted before storage and never shown in plain text
            after the connection.
          </Faq>
        </div>
      </DocSection>
    </>
  );
}
