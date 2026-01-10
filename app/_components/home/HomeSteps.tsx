import { motion } from "framer-motion";

import { fadeInUp, staggerChildren } from "./animations";
import { ArrowRightIcon, steps } from "./constants";

export function HomeSteps() {
  return (
    <section className="space-y-8">
      <motion.div {...fadeInUp} className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-slate-900">簡単3ステップで始める</h2>
        <p className="text-lg text-slate-600">面倒な設定は一切不要。今すぐ就活効率化を体験してください</p>
      </motion.div>

      <motion.div
        variants={staggerChildren}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="grid gap-6 md:grid-cols-3"
      >
        {steps.map((step, index) => (
          <motion.div
            key={step.step}
            variants={fadeInUp}
            className="relative rounded-2xl border border-slate-200/80 bg-white/90 p-6 text-center shadow-lg"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-bold text-white shadow-lg">
              {step.step}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
            <p className="text-slate-600 text-sm">{step.description}</p>

            {index < steps.length - 1 && (
              <div className="absolute -right-3 top-1/2 hidden md:block">
                <ArrowRightIcon className="h-6 w-6 text-amber-400" />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
