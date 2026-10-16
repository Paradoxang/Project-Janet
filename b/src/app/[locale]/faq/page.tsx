import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return { title: t("titulo") };
}

export default async function PreguntasFrecuentes({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const preguntas = t.raw("preguntas") as { id: string; q: string; a: string }[];
  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 md:px-6">
      <h1 className="text-[28px] md:text-4xl">{t("titulo")}</h1>
      <p className="mt-1 text-sm text-muted-ink">{t("nota")}</p>
      <Accordion type="multiple" className="mt-5 rounded-card border px-4">
        {preguntas.map((p) => (
          <AccordionItem key={p.id} value={p.id} id={p.id} className="scroll-mt-12">
            <AccordionTrigger className="text-base font-bold">{p.q}</AccordionTrigger>
            <AccordionContent className="text-[15px] text-ink/90">{p.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
