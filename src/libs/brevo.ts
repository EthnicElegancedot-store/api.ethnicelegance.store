import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
} from "@getbrevo/brevo";

const transactionalEmailsApi = new TransactionalEmailsApi();

transactionalEmailsApi.setApiKey(
  TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!,
);

export async function sendEmail({
  subject,
  htmlContent,
  to,
}: {
  subject: string;
  htmlContent: string;
  to: { email: string; name: string };
}) {
  const res = await transactionalEmailsApi.sendTransacEmail({
    subject,
    htmlContent,
    sender: {
      name: "Ethnic Elegance",
      email: "team@ethnicelegance.store",
    },
    to: [{ email: to.email, name: to.name }],
  });

  return res.body.messageId;
}
