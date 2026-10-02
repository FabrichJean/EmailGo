import TemplateForm from "../TemplateForm";
import { requireUser } from "@/lib/auth/session";

export default async function NewTemplatePage() {
  const user = await requireUser();
  return <TemplateForm userEmail={user.email} />;
}
