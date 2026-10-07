import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Choose your specialty",
    description: "Start with the system built for your field, with its clinical tools already in place, not a blank template to configure.",
    outcome: "Services · Staff · Patient records",
  },
  {
    number: "02",
    title: "Bring in your team and records",
    description: "Add your practitioners, services and existing patient records into a system that already speaks your specialty.",
    outcome: "Schedules · Access · Billing",
  },
  {
    number: "03",
    title: "Practise without workarounds",
    description: "Charting, orders, lab work and billing follow the real workflow of your discipline, with no manual notes or spreadsheets.",
    outcome: "Appointments · Invoices · Activity",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="site-section-tint py-20 md:py-28">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-4"
          >
            <span className="site-eyebrow block text-primary">Find your system</span>
            <h2 className="mt-4 max-w-sm text-3xl text-foreground md:text-4xl">
              Find the System Built for Your Practice.
            </h2>
            <p className="mt-5 max-w-sm leading-relaxed text-muted-foreground">
              Choose the dedicated system for your field: Dental, Eye Care, Fertility, Diagnostics or General Practice.
            </p>
          </motion.header>

          <ol className="border-t border-border/30 lg:col-span-8">
            {steps.map((step, index) => (
              <motion.li
                key={step.number}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="grid gap-4 border-b border-border/30 py-8 sm:grid-cols-[3rem_1fr] md:grid-cols-[3rem_1fr_12rem] md:gap-6 md:py-10"
              >
                <span className="font-mono text-xs tabular-nums text-primary">{step.number}</span>
                <div>
                  <h3 className="text-xl text-foreground md:text-2xl">{step.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                    {step.description}
                  </p>
                </div>
                <p className="self-start text-xs leading-relaxed text-muted-foreground md:text-right">
                  {step.outcome}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
