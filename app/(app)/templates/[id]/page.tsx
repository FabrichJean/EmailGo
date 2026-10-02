import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TemplateForm from "../TemplateForm";
import { requireUser } from "@/lib/auth/session";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const template = await prisma.template.findFirst({ where: { id, userId: user.id } });

  if (!template) {
    notFound();
  }

  return (
    <TemplateForm
      templateId={template.id}
      initialName={template.name}
      initialSubject={template.subject}
      initialBody={template.body}
      initialCreatedAt={template.createdAt.toISOString()}
    />
  );
}
