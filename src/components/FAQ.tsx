import { useEffect, useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export default function FAQ({ items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (items.length === 0) return null;

  return (
    <section
      data-faq
      data-faq-accordion
      className="border-border bg-surface my-12 rounded-lg border p-6"
    >
      <h2 className="text-foreground mb-6 text-2xl font-black uppercase">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {items.map((item, index) => (
          <details
            key={index}
            data-faq-item
            open={isClient && openIndex === index}
            onToggle={(e) => {
              if ((e.target as HTMLDetailsElement).open) {
                setOpenIndex(index);
              } else {
                setOpenIndex(null);
              }
            }}
            className="border-border group border-b pb-4 last:border-0"
          >
            <summary
              data-faq-question
              className="text-foreground hover:text-accent flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold"
            >
              <span>{item.question}</span>
              <span
                aria-hidden="true"
                className="text-muted-foreground group-open:text-foreground font-mono text-sm select-none"
              >
                {isClient && openIndex === index ? "-" : "+"}
              </span>
            </summary>
            <div
              data-faq-answer
              className="text-muted-foreground prose prose-sm dark:prose-invert mt-3 max-w-none"
            >
              <p dangerouslySetInnerHTML={{ __html: item.answer }} />
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
