import { notFound } from "next/navigation";
import { getTemplateBySlug } from "@/lib/prompts";
import { TemplateForm } from "@/components/TemplateForm";

interface TemplatePageProps {
  params: Promise<{ slug: string }>;
}

/** Detail page: shows one template's variable fill-in form. */
export default async function TemplatePage({ params }: TemplatePageProps) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    notFound();
  }

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
        <div>
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            {template.title}
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            {template.description}
          </p>
        </div>

        <TemplateForm template={template} />
      </main>
    </div>
  );
}
