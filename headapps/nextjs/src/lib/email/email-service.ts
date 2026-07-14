import nodemailer from 'nodemailer';
import client from 'lib/sitecore-client';
import { log } from 'src/util/helpers/log-helper';

const COMPONENT = 'email-service';

const JOIN_REQUEST_SUBJECT_KEY = 'CollabSitesJoinRequestEmailSubject';
const JOIN_REQUEST_BODY_KEY = 'CollabSitesJoinRequestEmailBody';
const DEFAULT_SUBJECT_TEMPLATE = 'Request to Join: ${collabSiteName}';
const DEFAULT_BODY_TEMPLATE =
  '${displayName} (${senderEmail}) has requested to join the "${collabSiteName}" collaboration site.\r\n\r\nPlease review this request and take the appropriate action in the Google Groups admin console.';

/**
 * Creates a nodemailer SMTP transport from environment variables.
 *
 * Required env vars:
 *   - SMTP_HOST        — SMTP relay hostname (e.g. smtp-relay.gmail.com)
 *   - SMTP_PORT        — Port number (defaults to 587)
 *   - SMTP_FROM_ADDRESS — System "from" address (e.g. no-reply@ascension.org)
 *
 * Optional env vars (when the relay requires authentication):
 *   - SMTP_USER
 *   - SMTP_PASSWORD
 *
 * Optional env var:
 *   - SMTP_IGNORE_TLS — set to 'true' to skip STARTTLS on port 25 relays that
 *     don't require encryption. Nodemailer auto-upgrades to TLS when the server
 *     advertises STARTTLS, so this is needed when the relay's cert is expired
 *     or self-signed but the session itself doesn't need to be encrypted.
 */
function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const fromAddress = process.env.SMTP_FROM_ADDRESS;

  if (!host) {
    throw new Error('SMTP_HOST environment variable is required for email sending');
  }
  if (!fromAddress) {
    throw new Error('SMTP_FROM_ADDRESS environment variable is required for email sending');
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const ignoreTLS = process.env.SMTP_IGNORE_TLS === 'true';

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    ignoreTLS,
    ...(user && pass ? { auth: { user, pass } } : {}),
  });
}

/**
 * Interpolates `${token}` placeholders in a template string with provided values.
 *
 * Example: `interpolate('Hello ${name}!', { name: 'World' })` → `'Hello World!'`
 */
function interpolate(template: string, values: Record<string, string>): string {
  return template.replace(/\$\{(\w+)\}/g, (_, key) => values[key] ?? '');
}

export async function sendJoinRequestEmail(options: {
  senderEmail: string;
  recipientEmails: string[];
  collabSiteName: string;
  requesterName?: string;
}): Promise<void> {
  const { senderEmail, recipientEmails, collabSiteName, requesterName } = options;

  let subjectTemplate = DEFAULT_SUBJECT_TEMPLATE;
  let bodyTemplate = DEFAULT_BODY_TEMPLATE;
  try {
    const dict = await client.getDictionary({ site: 'DFD', locale: 'en' });
    subjectTemplate =
      (dict as Record<string, string>)[JOIN_REQUEST_SUBJECT_KEY] || DEFAULT_SUBJECT_TEMPLATE;
    bodyTemplate = (dict as Record<string, string>)[JOIN_REQUEST_BODY_KEY] || DEFAULT_BODY_TEMPLATE;
  } catch (dictError) {
    log('WARNING', COMPONENT, 'Failed to load dictionary; using default email templates', {
      error: String(dictError),
    });
  }

  if (!recipientEmails.length) {
    throw new Error(
      `No join request email recipients configured for collab site "${collabSiteName}"`
    );
  }

  const displayName = requesterName || senderEmail;
  const fromAddress = process.env.SMTP_FROM_ADDRESS!;

  const tokens: Record<string, string> = {
    collabSiteName,
    senderEmail,
    displayName,
  };

  const subject = interpolate(subjectTemplate, tokens);
  // Normalize line-break escapes: templates may arrive with literal `\r\n` or `\n`
  // depending on how they were authored in Sitecore. Convert all to real newlines
  // and drop stray `\r` so the email renders with clean line breaks.
  const body = interpolate(bodyTemplate, tokens)
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '');

  const transport = createTransport();

  await transport.sendMail({
    from: fromAddress,
    replyTo: senderEmail,
    to: recipientEmails.join(', '),
    subject,
    text: body,
  });

  log('INFO', COMPONENT, 'Join request email sent', {
    from: fromAddress,
    replyTo: senderEmail,
    recipientEmails,
    collabSiteName,
  });
}
