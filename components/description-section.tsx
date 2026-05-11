"use client";

import { type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CircleHelp } from "lucide-react";
import { Accordion } from "./ui/accordion";

export type DescriptionSectionProps = {
  namespace: string;
  faqCount?: number;
  howToStepCount?: number;
  extraSections?: ReactNode;
  showWhatIs?: boolean;
  showUseCases?: boolean;
  showHowTo?: boolean;
  showFaq?: boolean;
};

export default function DescriptionSection({
  namespace,
  faqCount = 3,
  howToStepCount = 3,
  extraSections,
  showWhatIs = true,
  showUseCases = true,
  showHowTo = true,
  showFaq = true,
}: DescriptionSectionProps) {
  const t = useTranslations(namespace);
  const tc = useTranslations("common");
  const ns = "descriptions";

  const hasAeoDefinition = t.has(`${ns}.aeoDefinition`);
  const hasWhatIsMulti = t.has(`${ns}.whatIsP1`);
  const hasWhatIsSingle = t.has(`${ns}.whatIs`);
  const hasUseCasesMulti = t.has(`${ns}.useCasesDesc1`);
  const hasUseCasesPlain = t.has(`${ns}.useCasesP1`);
  const hasFaq = showFaq && t.has(`${ns}.faq1Q`);

  const steps: { title: string; text: string }[] = [];
  if (showHowTo) {
    for (let i = 1; i <= howToStepCount; i++) {
      if (t.has(`${ns}.step${i}Title`)) {
        steps.push({
          title: t(`${ns}.step${i}Title`),
          text: t.has(`${ns}.step${i}Text`) ? t(`${ns}.step${i}Text`) : "",
        });
      }
    }
  }

  const faqItems = [];
  if (hasFaq) {
    for (let i = 1; i <= faqCount; i++) {
      if (t.has(`${ns}.faq${i}Q`)) {
        faqItems.push({
          title: t(`${ns}.faq${i}Q`),
          content: <p>{t(`${ns}.faq${i}A`)}</p>,
        });
      }
    }
  }

  if (
    !hasAeoDefinition &&
    !hasWhatIsMulti &&
    !hasWhatIsSingle &&
    !hasUseCasesMulti &&
    !hasUseCasesPlain &&
    steps.length === 0 &&
    !extraSections &&
    faqItems.length === 0
  ) {
    return null;
  }

  return (
    <section id="description" className="mt-8">
      {hasAeoDefinition && (
        <div className="border-l-2 border-accent-cyan/40 pl-4 py-2.5 mb-4">
          <p className="text-fg-secondary text-sm leading-relaxed">{t(`${ns}.aeoDefinition`)}</p>
        </div>
      )}

      {showWhatIs && hasWhatIsMulti && (
        <div className="mb-4">
          {t.has(`${ns}.whatIsTitle`) && (
            <h2 className="font-semibold text-fg-primary text-base">{t(`${ns}.whatIsTitle`)}</h2>
          )}
          <div className="mt-1 space-y-1.5 text-fg-secondary text-sm leading-relaxed">
            {[1, 2, 3, 4, 5].map(
              (i) => t.has(`${ns}.whatIsP${i}`) && <p key={i}>{t(`${ns}.whatIsP${i}`)}</p>
            )}
          </div>
        </div>
      )}

      {showWhatIs && !hasWhatIsMulti && hasWhatIsSingle && (
        <div className="mb-4">
          {t.has(`${ns}.whatIsTitle`) && (
            <h2 className="font-semibold text-fg-primary text-base">{t(`${ns}.whatIsTitle`)}</h2>
          )}
          <p className="text-fg-secondary text-sm mt-1 leading-relaxed">{t(`${ns}.whatIs`)}</p>
        </div>
      )}

      {showUseCases && hasUseCasesMulti && (
        <div className="mb-4">
          {t.has(`${ns}.useCasesTitle`) && (
            <h2 className="font-semibold text-fg-primary text-base">{t(`${ns}.useCasesTitle`)}</h2>
          )}
          <div className="mt-1 space-y-3 text-fg-secondary text-sm leading-relaxed">
            {[1, 2, 3, 4, 5].map(
              (i) =>
                t.has(`${ns}.useCasesP${i}`) && (
                  <div key={i}>
                    <p className="font-medium text-fg-primary">{t(`${ns}.useCasesDesc${i}`)}</p>
                    <p className="mt-0.5">{t(`${ns}.useCasesP${i}`)}</p>
                  </div>
                )
            )}
          </div>
        </div>
      )}

      {showUseCases && !hasUseCasesMulti && hasUseCasesPlain && (
        <div className="mb-4">
          {t.has(`${ns}.useCasesTitle`) && (
            <h2 className="font-semibold text-fg-primary text-base">{t(`${ns}.useCasesTitle`)}</h2>
          )}
          <div className="mt-1 space-y-1.5 text-fg-secondary text-sm leading-relaxed">
            {[1, 2, 3, 4, 5].map(
              (i) => t.has(`${ns}.useCasesP${i}`) && <p key={i}>{t(`${ns}.useCasesP${i}`)}</p>
            )}
          </div>
        </div>
      )}

      {steps.length > 0 && (
        <div className="mb-4">
          {t.has(`${ns}.stepsTitle`) && (
            <h2 className="font-semibold text-fg-primary text-base">{t(`${ns}.stepsTitle`)}</h2>
          )}
          <ol className="mt-2 space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-cyan/20 text-xs font-semibold text-accent-cyan">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-fg-primary text-sm">{step.title}</p>
                  {step.text && <p className="text-fg-secondary text-sm mt-0.5">{step.text}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {extraSections}

      {faqItems.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <CircleHelp size={16} className="text-accent-cyan shrink-0" aria-hidden="true" />
            <h2 className="font-semibold text-fg-primary text-base text-pretty">
              {tc("descriptions.faqTitle")}
            </h2>
          </div>
          <Accordion items={faqItems} />
        </div>
      )}
    </section>
  );
}
