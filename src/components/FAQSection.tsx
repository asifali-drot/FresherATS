"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
  description?: string;
  defaultOpenIndex?: number;
}

export default function FAQSection({ faqs, title = "Frequently Asked Questions", description, defaultOpenIndex }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex ?? null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="w-full py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white mb-4 tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">
              {description}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={cn(
                "group border rounded-2xl transition-all duration-300 overflow-hidden",
                openIndex === index 
                  ? "border-purple-200 dark:border-purple-900/50 bg-purple-50/30 dark:bg-purple-900/20 ring-1 ring-purple-100 dark:ring-purple-900/50" 
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className={cn(
                  "text-lg font-bold transition-colors",
                  openIndex === index ? "text-purple-700 dark:text-purple-400" : "text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white"
                )}>
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform duration-300 shrink-0",
                    openIndex === index ? "rotate-180 text-purple-600 dark:text-purple-400" : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-500 dark:group-hover:text-zinc-400"
                  )}
                />
              </button>

              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  openIndex === index ? "grid-rows-[1fr] opacity-100 pb-6 px-6" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
