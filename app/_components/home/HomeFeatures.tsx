import { motion } from "framer-motion";

import { fadeInUp, staggerChildren } from "./animations";
import { CheckCircleIcon, features } from "./constants";

export function HomeFeatures() {
  return (
    <section id="features" className="space-y-8">
      <motion.div {...fadeInUp} className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-slate-900">就活を変える3つの機能</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          AI技術と効率的な管理機能で、就活の成功確率を大幅に向上させます
        </p>
      </motion.div>

      <motion.div
        variants={staggerChildren}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="grid gap-8 md:grid-cols-3"
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            variants={fadeInUp}
            whileHover={{ scale: 1.02, y: -5 }}
            className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-lg backdrop-blur transition-all duration-300"
          >
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
            <p className="text-slate-600 mb-4 leading-6">{feature.description}</p>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              <CheckCircleIcon className="h-4 w-4" />
              {feature.benefit}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
