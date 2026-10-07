import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import dashboardAsset from "@/assets/current-dashboard/dental-dashboard.png.asset.json";

const dashboardScreenshot = dashboardAsset.url;

const proofPoints = [
  { value: "Specialized", label: "Clinical systems built for each field of care" },
  { value: "Zero", label: "Workarounds, manual notes or spreadsheets" },
  { value: "Yours", label: "Built around the workflow your specialty runs on" },
];

const HeroSection = () => {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax layers: background orbs drift slow, dashboard floats faster
  const orbSlowY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 120]);
  const orbFastY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -90]);
  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -60]);
  const glassCardY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -130]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[hsl(var(--medical-blue-dark))] py-20 md:py-28">
      {/* Parallax glow layers */}
      <motion.div
        aria-hidden
        style={{ y: orbSlowY }}
        className="pointer-events-none absolute -top-32 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl"
      />
      <motion.div
        aria-hidden
        style={{ y: orbFastY }}
        className="pointer-events-none absolute top-1/3 left-[-8%] h-72 w-72 rounded-full bg-[hsl(var(--medical-teal))]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div className="container relative z-10">
        <div className="grid items-end gap-12 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <span className="site-eyebrow block text-white/50">
              Clinexus
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl text-white md:text-5xl lg:text-[3.75rem]">
              Healthcare software should{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--medical-teal))] bg-clip-text text-transparent">
                understand healthcare.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/60">
              You do not simply need software that can store patient information.
              You need software that understands how your facility actually operates,
              from your front desk to your treatment rooms. That is exactly what
              Clinexus was built for.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="https://wa.me/2349017758165?text=Hello%20I%20would%20like%20to%20know%20more%20about%20Clinexus" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="gap-2 rounded-sm bg-primary px-8 text-white shadow-lg shadow-primary/30 hover:opacity-90">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <Link to="/login">
                <Button size="lg" variant="outline" className="gap-2 rounded-sm border-white/25 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white">
                  See Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="divide-y divide-white/10 border-y border-white/10">
              {proofPoints.map((point, i) => (
                <motion.div
                  key={point.value}
                  initial={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
                  className="flex items-baseline gap-5 py-5"
                >
                  <dt className="w-32 shrink-0 text-xl text-white">{point.value}</dt>
                  <dd className="text-sm leading-relaxed text-white/50">{point.label}</dd>
                </motion.div>
              ))}
            </div>
          </motion.dl>
        </div>

        {/* Floating dashboard plane */}
        <motion.figure
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="relative mt-16"
        >
          <motion.div
            style={{ y: dashboardY }}
            className="site-hairline-invert overflow-hidden rounded-md shadow-2xl shadow-black/40 md:-rotate-1"
          >
            <img
              src={dashboardScreenshot}
              alt="Clinexus dashboard showing clinic revenue, appointments and patient records"
              className="w-full"
            />
          </motion.div>

          {/* Overlapping glass card on its own faster parallax plane */}
          <motion.div
            style={{ y: glassCardY }}
            initial={{ opacity: 0, y: 32, rotate: 3 }}
            animate={{ opacity: 1, y: 0, rotate: 3 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="absolute -top-8 right-4 hidden w-52 rounded-2xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-md md:block"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--medical-teal))]">
              Every specialty
            </div>
            <div className="mt-1 text-xl font-bold text-white">Its own system</div>
            <div className="mt-3 h-1 w-full rounded-full bg-white/10">
              <div className="h-full w-2/3 rounded-full bg-[hsl(var(--medical-teal))]" />
            </div>
          </motion.div>

          <figcaption className="mt-3 text-xs text-white/35">
            The Clinexus dashboard: today's schedule, outstanding invoices and clinic revenue on one screen.
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
};

export default HeroSection;
