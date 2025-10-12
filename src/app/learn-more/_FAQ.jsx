"use client";
import { Accordion, AccordionItem } from "@szhsin/react-accordion";
import { ChevronDown } from "lucide-react";

const items = [
    {
        type: "ordering",
        question: "How do I place an order?",
        answer: "You can orger directly through our website by adding your desired pieces to your cart and checking out securely.",
    },
    {
        type: "ordering",
        question: "Can I change my order after it's been placed?",
        answer: "Yes. If your order hasn't been shipped yet, contact us as soon as possible and we'll do our best to assist.",
    },
    {
        type: "shipping",
        question: "Does Daye Jewellery ship internationally?",
        answer: "Yes. We ship worldwide. Shipping times and costs vary depending on your location and will be shown at checkout.",
    },
    {
        type: "shipping",
        question: "How long will my order take to arrive?",
        answer: "For Australian Orders, delivery typically takes 2-5 business days. International orders can take 7-14 business days, depending on customs.",
    },
    {
        type: "shipping",
        question: "How can I track my order?",
        answer: "Once your order is shipped, we'll send you a tracking link via email so that you can follow its journey.",
    },
    {
        type: "materials",
        question: "What materials do you use for your jewellery?",
        answer: "Our pieces are crafted from high quality metals such as sterling silver and gold vermeil, with ethically sourced gemstones and pearls.",
    },
    {
        type: "materials",
        question: "Is your jewellery hypoallergenic?",
        answer: "Yes, our jewellery is nickel-free and safe for sensitive skin.",
    },
    {
        type: "materials",
        question: "How should I care for my jewellery?",
        answer: "We recommend storing your jewellery in a cool, dry place and avoiding contact with water, perfumes, and lotions to maintain its shine.",
    },
    {
        type: "returns",
        question: "What is your returns policy?",
        answer: "We accept returns within 14 days of delivery of unworn, original conditions pieces. Custom or engraved items are non-returnable.",
    },
    {
        type: "returns",
        question: "How do I return my item?",
        answer: "Please email us at dayejewelleryhelp@gmail.com to arrange your return and recieve instructions.",
    },
    {
        type: "warranty",
        question: "Do you offer a warranty?",
        answer: "Yes, all Daye Jewellery pieces come with a 6-month warranty covering manufacturing defects.",
    },
    {
        type: "warranty",
        question: "Can you repair damaged jewellery?",
        answer: "No. Currently, we do not. We are working towards this for the forseeable future.",
    },
    {
        type: "payment",
        question: "What payment methods do you accept?",
        answer: "We accept major credit cards, Paypal, Apple Pay, and other secure payment methods.",
    },
];

const sectionTitles = {
  ordering: "Ordering",
  shipping: "Shipping and Delivery",
  materials: "Jewellery Materials and Care",
  returns: "Returns and Exchanges",
  warranty: "Warranty and Repairs",
  payment: "Payment",
};

export default function FAQs() {
  const grouped = items.reduce((acc, item) => {
    acc[item.type] = acc[item.type] || [];
    acc[item.type].push(item);
    return acc;
  }, {});

  return (
    <div className="flex flex-col w-full items-center justify-center">
      <div className="flex flex-col w-full max-w-3xl space-y-8">
        {Object.keys(grouped).map((type) => (
          <div key={type}>
            <h3 className="text-lg sm:text-xl font-semibold text-dark border-b border-dark/20 pb-2 mb-4">
              {sectionTitles[type]}
            </h3>
            <Accordion className="flex flex-col gap-3 w-full">
              {grouped[type].map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  header={({ state }) => (
                    <div
                      className="flex w-full items-center justify-between 
                                 text-left text-dark font-semibold rounded-md
                                 px-4 py-3 cursor-pointer
                                 hover:bg-dark hover:text-light transition-all"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`transition-transform duration-300 ${
                          state?.isEnter ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  )}
                >
                  <div className="faq-answer px-4 py-3 font-light">
                    {faq.answer}
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
