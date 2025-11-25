"use client";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Wallet, TrendingUp, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10" />

        <motion.div
          className="container-custom max-w-5xl space-y-8 z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-block">
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20 backdrop-blur-sm">
              ✨ The Future of Expense Tracking
            </span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-tight">
            Master Your Finances with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">
              ExpenseApp
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Track expenses, plan budgets, and gain powerful insights to take control of your financial future with our AI-powered platform.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/auth/signin">
              <Button size="lg" variant="glow" className="w-full sm:w-auto px-10 shadow-xl shadow-primary/20">
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-10">
                Learn More
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container-custom">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold tracking-tight mb-6">Why Choose ExpenseApp?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your money effectively, wrapped in a beautiful interface.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {[
              {
                icon: Wallet,
                title: "Smart Budgeting",
                desc: "Create customized budgets to manage your finances effectively and avoid overspending.",
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              },
              {
                icon: TrendingUp,
                title: "Spending Analysis",
                desc: "Get detailed insights and reports to understand your spending habits and make informed decisions.",
                color: "text-green-500",
                bg: "bg-green-500/10"
              },
              {
                icon: ShieldCheck,
                title: "Secure & Private",
                desc: "Your data is protected with top-level security measures ensuring your privacy at all times.",
                color: "text-purple-500",
                bg: "bg-purple-500/10"
              },
              {
                icon: Zap,
                title: "Easy Tracking",
                desc: "Quickly add and categorize expenses to keep your financial records up-to-date effortlessly.",
                color: "text-yellow-500",
                bg: "bg-yellow-500/10"
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full glass-card-hover border-white/5 bg-card/40 backdrop-blur-md">
                  <CardHeader>
                    <div className={`h-14 w-14 rounded-2xl ${feature.bg} flex items-center justify-center ${feature.color} mb-4 shadow-inner`}>
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}