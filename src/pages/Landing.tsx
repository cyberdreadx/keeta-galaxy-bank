import { Link } from "react-router-dom";
import { StarField } from "@/components/StarField";
import { motion } from "framer-motion";
import { 
  Shield, 
  Zap, 
  Globe, 
  ArrowRight, 
  Wallet, 
  Send, 
  QrCode,
  ArrowLeftRight,
  Hexagon,
  Star,
  ChevronRight,
  Lock,
  Smartphone,
  CreditCard,
  Check,
  ChevronDown,
  ExternalLink,
  Users,
  TrendingUp,
  Clock
} from "lucide-react";
import { useState } from "react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const Landing = () => {
  return (
    <div className="min-h-screen relative bg-sw-space overflow-x-hidden">
      <StarField />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-sw-space/80 backdrop-blur-xl border-b border-sw-blue/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <Hexagon className="w-10 h-10 text-sw-green [filter:drop-shadow(0_0_15px_hsl(var(--sw-green)/0.6))]" strokeWidth={1.5} />
                <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-sm text-sw-green">Y</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-lg tracking-[0.15em]">
                  <span className="text-sw-green">YODA</span>
                  <span className="text-sw-blue">WALLET</span>
                </h1>
              </div>
            </motion.div>
            
            <motion.div
              className="hidden md:flex items-center gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <a href="#features" className="font-mono text-xs text-sw-blue/60 hover:text-sw-blue transition-colors tracking-wider">FEATURES</a>
              <a href="#security" className="font-mono text-xs text-sw-blue/60 hover:text-sw-blue transition-colors tracking-wider">SECURITY</a>
              <a href="#networks" className="font-mono text-xs text-sw-blue/60 hover:text-sw-blue transition-colors tracking-wider">NETWORKS</a>
              <a href="#faq" className="font-mono text-xs text-sw-blue/60 hover:text-sw-blue transition-colors tracking-wider">FAQ</a>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link
                to="/"
                className="group px-6 py-2.5 bg-sw-green/20 border border-sw-green/50 text-sw-green font-display font-bold tracking-wider hover:bg-sw-green hover:text-sw-space transition-all duration-300"
              >
                LAUNCH APP
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 pb-20 px-6 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-sw-green/8 rounded-full blur-[150px]"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-sw-blue/8 rounded-full blur-[120px]"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.2, 0.4]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(77,166,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(77,166,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="container mx-auto text-center relative z-10">
          <motion.div 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sw-green/10 border border-sw-green/30 rounded-full mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sw-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sw-green"></span>
            </span>
            <span className="font-mono text-xs text-sw-green tracking-wider">LIVE ON KEETA MAINNET</span>
          </motion.div>
          
          <motion.h1 
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-wider mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="block text-sw-white mb-2">YOUR GATEWAY TO</span>
            <span className="block relative">
              <span className="bg-gradient-to-r from-sw-green via-sw-blue to-sw-green bg-clip-text text-transparent bg-[size:200%_auto] animate-[gradient_3s_linear_infinite]">
                KEETA NETWORK
              </span>
              <motion.div 
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 bg-gradient-to-r from-transparent via-sw-green to-transparent"
                initial={{ width: 0 }}
                animate={{ width: "60%" }}
                transition={{ delay: 1, duration: 0.8 }}
              />
            </span>
          </motion.h1>
          
          <motion.p 
            className="font-mono text-base md:text-lg text-sw-blue/70 max-w-2xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            The most powerful non-custodial wallet for Keeta blockchain. 
            Send, receive, bridge, and manage your KTA with military-grade security.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              to="/"
              className="group relative flex items-center gap-3 px-10 py-4 bg-sw-green text-sw-space font-display font-bold tracking-wider overflow-hidden"
            >
              <span className="relative z-10">GET STARTED FREE</span>
              <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-sw-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
            </Link>
            <a
              href="https://docs.keeta.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-10 py-4 border border-sw-blue/40 text-sw-blue font-display tracking-wider hover:bg-sw-blue/10 hover:border-sw-blue/60 transition-all"
            >
              READ DOCS
              <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>
          
          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <StatCard value="10M+" label="TPS CAPACITY" icon={<Zap className="w-5 h-5" />} />
            <StatCard value="400ms" label="SETTLEMENT" icon={<Clock className="w-5 h-5" />} />
            <StatCard value="$0.001" label="AVG FEE" icon={<CreditCard className="w-5 h-5" />} />
            <StatCard value="2" label="NETWORKS" icon={<Globe className="w-5 h-5" />} />
          </motion.div>
          
          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <span className="font-mono text-[10px] text-sw-blue/40 tracking-wider">SCROLL</span>
              <ChevronDown className="w-5 h-5 text-sw-blue/40" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-sw-green/5 via-transparent to-transparent" />
        <div className="container mx-auto relative">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <p className="font-mono text-xs text-sw-green tracking-[0.5em] mb-4">// INTERFACE</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-sw-white tracking-wider mb-4">
              DESIGNED FOR <span className="text-sw-green">POWER USERS</span>
            </h2>
            <p className="font-mono text-sw-blue/60 max-w-xl mx-auto">
              A sleek, intuitive interface that puts you in control of your digital assets.
            </p>
          </motion.div>
          
          {/* Mock App Display */}
          <motion.div 
            className="max-w-4xl mx-auto relative"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-sw-green/20 via-sw-blue/20 to-sw-green/20 blur-2xl opacity-50" />
            <div className="relative bg-sw-space border border-sw-blue/30 rounded-lg overflow-hidden">
              {/* Browser bar */}
              <div className="bg-sw-blue/10 border-b border-sw-blue/20 px-4 py-3 flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-sw-red/60" />
                  <div className="w-3 h-3 rounded-full bg-sw-yellow/60" />
                  <div className="w-3 h-3 rounded-full bg-sw-green/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-sw-blue/10 px-4 py-1 rounded font-mono text-xs text-sw-blue/60">
                    yodawallet.app
                  </div>
                </div>
              </div>
              
              {/* App content mockup */}
              <div className="p-8 grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-sw-blue/5 border border-sw-blue/20 p-6 rounded">
                    <p className="font-mono text-xs text-sw-blue/60 mb-2">TOTAL BALANCE</p>
                    <p className="font-display text-4xl font-bold text-sw-green mb-1">12,450.00 KTA</p>
                    <p className="font-mono text-sm text-sw-blue/60">≈ $24,900.00 USD</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: <Send className="w-5 h-5" />, label: "SEND" },
                      { icon: <QrCode className="w-5 h-5" />, label: "RECEIVE" },
                      { icon: <ArrowLeftRight className="w-5 h-5" />, label: "BRIDGE" }
                    ].map((action, i) => (
                      <div key={i} className="bg-sw-blue/10 border border-sw-blue/20 p-4 text-center rounded hover:bg-sw-blue/20 transition-colors cursor-pointer">
                        <div className="text-sw-blue mb-2 flex justify-center">{action.icon}</div>
                        <p className="font-mono text-xs text-sw-blue/80">{action.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-sw-blue/5 border border-sw-blue/20 p-4 rounded">
                  <p className="font-mono text-xs text-sw-blue/60 mb-4">RECENT ACTIVITY</p>
                  <div className="space-y-3">
                    {[
                      { type: "Received", amount: "+500 KTA", time: "2m ago" },
                      { type: "Sent", amount: "-120 KTA", time: "1h ago" },
                      { type: "Bridge", amount: "1000 KTA", time: "3h ago" }
                    ].map((tx, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-sw-blue/10 last:border-0">
                        <div>
                          <p className="font-mono text-xs text-sw-blue">{tx.type}</p>
                          <p className="font-mono text-[10px] text-sw-blue/50">{tx.time}</p>
                        </div>
                        <p className={`font-mono text-xs ${tx.amount.startsWith('+') ? 'text-sw-green' : 'text-sw-blue/80'}`}>{tx.amount}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <p className="font-mono text-xs text-sw-blue tracking-[0.5em] mb-4">// FEATURES</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-sw-white tracking-wider mb-4">
              EVERYTHING YOU <span className="text-sw-blue">NEED</span>
            </h2>
            <p className="font-mono text-sw-blue/60 max-w-xl mx-auto">
              Built for speed, security, and simplicity. Yoda Wallet has all the tools for managing your digital assets.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <FeatureCard
              icon={<Wallet className="w-7 h-7" />}
              title="NON-CUSTODIAL"
              description="Your keys, your crypto. Full control over your assets with encrypted local storage."
              color="green"
            />
            <FeatureCard
              icon={<Zap className="w-7 h-7" />}
              title="INSTANT TRANSFERS"
              description="Send KTA anywhere in under 400ms with near-zero transaction fees."
              color="yellow"
            />
            <FeatureCard
              icon={<ArrowLeftRight className="w-7 h-7" />}
              title="CROSS-CHAIN BRIDGE"
              description="Seamlessly bridge assets between Keeta L1 and Base networks."
              color="orange"
            />
            <FeatureCard
              icon={<Users className="w-7 h-7" />}
              title="MULTI-ACCOUNT"
              description="Manage checking, savings, and custom accounts all from one seed."
              color="blue"
            />
            <FeatureCard
              icon={<QrCode className="w-7 h-7" />}
              title="QR PAYMENTS"
              description="Generate and scan QR codes for quick, contactless transactions."
              color="green"
            />
            <FeatureCard
              icon={<Smartphone className="w-7 h-7" />}
              title="MOBILE READY"
              description="PWA and native iOS/Android apps for crypto on the go."
              color="blue"
            />
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-sw-blue/5 to-transparent">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <p className="font-mono text-xs text-sw-yellow tracking-[0.5em] mb-4">// GET STARTED</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-sw-white tracking-wider mb-4">
              HOW IT <span className="text-sw-yellow">WORKS</span>
            </h2>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-sw-green via-sw-yellow to-sw-blue" />
              
              {[
                { step: "01", title: "CREATE WALLET", desc: "Generate a secure seed phrase or import an existing one. Your keys are encrypted locally.", icon: <Wallet className="w-6 h-6" />, color: "sw-green" },
                { step: "02", title: "FUND ACCOUNT", desc: "Receive KTA via QR code or address. Bridge from Base if you have tokens there.", icon: <CreditCard className="w-6 h-6" />, color: "sw-yellow" },
                { step: "03", title: "START USING", desc: "Send, receive, bridge, and manage your crypto with the full power of Keeta.", icon: <TrendingUp className="w-6 h-6" />, color: "sw-blue" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  className="text-center relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                >
                  <div className={`w-24 h-24 mx-auto mb-6 border-2 border-${item.color} bg-${item.color}/10 flex items-center justify-center relative`}>
                    <span className={`text-${item.color}`}>{item.icon}</span>
                    <span className={`absolute -top-3 -right-3 w-8 h-8 bg-${item.color} text-sw-space font-display font-bold text-sm flex items-center justify-center`}>
                      {item.step}
                    </span>
                  </div>
                  <h3 className={`font-display text-lg font-bold text-${item.color} mb-2 tracking-wider`}>{item.title}</h3>
                  <p className="font-mono text-xs text-sw-blue/60 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 px-6 relative">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="font-mono text-xs text-sw-yellow tracking-[0.5em] mb-4">// SECURITY</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-sw-white tracking-wider mb-6">
                BANK-GRADE <span className="text-sw-yellow">SECURITY</span>
              </h2>
              <p className="font-mono text-sw-blue/70 leading-relaxed mb-8">
                Your security is our top priority. Yoda Wallet uses industry-leading encryption and security practices to keep your assets safe.
              </p>
              
              <div className="space-y-4">
                {[
                  "AES-256 encryption for all sensitive data",
                  "Non-custodial - only you have your keys",
                  "Optional PIN/biometric lock protection",
                  "Open source and auditable code",
                  "No tracking, no analytics, no data collection"
                ].map((text, i) => (
                  <motion.div 
                    key={i}
                    className="flex items-center gap-4 group"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-6 h-6 border border-sw-green bg-sw-green/20 flex items-center justify-center flex-shrink-0 group-hover:bg-sw-green/30 transition-colors">
                      <Check className="w-4 h-4 text-sw-green" />
                    </div>
                    <span className="font-mono text-sm text-sw-blue/80">{text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-sw-yellow/10 blur-[80px]" />
              <div className="relative border border-sw-yellow/30 bg-sw-space/80 backdrop-blur-sm p-10">
                {/* Corner brackets */}
                <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-sw-yellow" />
                <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-sw-yellow" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-sw-yellow" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-sw-yellow" />
                
                <div className="flex items-center justify-center mb-8">
                  <motion.div
                    animate={{ 
                      boxShadow: [
                        "0 0 20px rgba(255,232,31,0.2)",
                        "0 0 40px rgba(255,232,31,0.4)",
                        "0 0 20px rgba(255,232,31,0.2)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Shield className="w-28 h-28 text-sw-yellow" />
                  </motion.div>
                </div>
                
                <div className="text-center mb-8">
                  <p className="font-display text-2xl font-bold text-sw-yellow mb-2 tracking-wider">FORTRESS MODE</p>
                  <p className="font-mono text-xs text-sw-blue/60">Military-grade encryption active</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-sw-yellow/10 border border-sw-yellow/20">
                    <Lock className="w-5 h-5 text-sw-yellow mx-auto mb-1" />
                    <p className="font-mono text-[10px] text-sw-yellow/80">ENCRYPTED</p>
                  </div>
                  <div className="p-3 bg-sw-yellow/10 border border-sw-yellow/20">
                    <Shield className="w-5 h-5 text-sw-yellow mx-auto mb-1" />
                    <p className="font-mono text-[10px] text-sw-yellow/80">PROTECTED</p>
                  </div>
                  <div className="p-3 bg-sw-yellow/10 border border-sw-yellow/20">
                    <Check className="w-5 h-5 text-sw-yellow mx-auto mb-1" />
                    <p className="font-mono text-[10px] text-sw-yellow/80">VERIFIED</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Networks Section */}
      <section id="networks" className="py-24 px-6 bg-gradient-to-b from-transparent via-sw-blue/5 to-transparent">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <p className="font-mono text-xs text-sw-blue tracking-[0.5em] mb-4">// NETWORKS</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-sw-white tracking-wider mb-4">
              MULTI-CHAIN <span className="text-sw-blue">SUPPORT</span>
            </h2>
            <p className="font-mono text-sw-blue/60 max-w-xl mx-auto">
              Seamlessly operate across multiple networks with our integrated bridge technology.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <NetworkCard
              name="Keeta L1"
              description="Native Keeta blockchain with 10M+ TPS, 400ms settlement, and near-zero fees"
              symbol="K"
              color="sw-blue"
              features={["10M+ TPS", "400ms finality", "$0.001 avg fee"]}
              primary
            />
            <NetworkCard
              name="Base (L2)"
              description="Ethereum L2 by Coinbase. Bridge KTA seamlessly between networks"
              symbol="B"
              color="sw-green"
              features={["Ethereum security", "Low fees", "Bridge support"]}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <p className="font-mono text-xs text-sw-green tracking-[0.5em] mb-4">// FAQ</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-sw-white tracking-wider">
              QUESTIONS <span className="text-sw-green">ANSWERED</span>
            </h2>
          </motion.div>
          
          <motion.div 
            className="space-y-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <FAQItem 
              question="Is Yoda Wallet free to use?" 
              answer="Yes! Yoda Wallet is completely free. You only pay network transaction fees when sending or bridging, which are typically less than $0.01 on Keeta."
            />
            <FAQItem 
              question="Is my crypto safe with Yoda Wallet?" 
              answer="Absolutely. Yoda Wallet is non-custodial, meaning only you have access to your private keys. Your seed phrase is encrypted and stored locally on your device - we never have access to it."
            />
            <FAQItem 
              question="What networks does Yoda Wallet support?" 
              answer="Currently, we support Keeta L1 (native) and Base (Ethereum L2). You can bridge KTA between these networks directly within the app."
            />
            <FAQItem 
              question="Can I use Yoda Wallet on mobile?" 
              answer="Yes! Yoda Wallet is available as a Progressive Web App (PWA) that works on any device, plus native iOS and Android apps for the best mobile experience."
            />
            <FAQItem 
              question="How do I recover my wallet?" 
              answer="When you create a wallet, you'll receive a 12 or 24-word seed phrase. Store this safely - it's the only way to recover your wallet if you lose access to your device."
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <motion.div 
            className="relative max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-sw-green/20 via-sw-blue/20 to-sw-green/20 blur-3xl" />
            <div className="relative border border-sw-green/30 bg-sw-space/80 backdrop-blur-sm p-12 md:p-16 text-center">
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-sw-green" />
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-sw-green" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-sw-green" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-sw-green" />
              
              <h2 className="font-display text-4xl md:text-5xl font-bold text-sw-white tracking-wider mb-6">
                START YOUR <span className="text-sw-green">JOURNEY</span>
              </h2>
              <p className="font-mono text-sw-blue/70 max-w-xl mx-auto mb-10">
                Join thousands of users already managing their KTA with Yoda Wallet. Free, secure, and powerful.
              </p>
              <Link
                to="/"
                className="group inline-flex items-center gap-3 px-12 py-5 bg-sw-green text-sw-space font-display font-bold tracking-wider hover:bg-sw-green/90 transition-all"
              >
                LAUNCH YODA WALLET
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-sw-blue/20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Hexagon className="w-10 h-10 text-sw-green" strokeWidth={1.5} />
                <span className="font-display font-bold text-xl tracking-wider">
                  <span className="text-sw-green">YODA</span>
                  <span className="text-sw-blue">WALLET</span>
                </span>
              </div>
              <p className="font-mono text-sm text-sw-blue/60 max-w-sm mb-6">
                The most powerful non-custodial wallet for Keeta Network. Secure, fast, and free.
              </p>
              <div className="flex gap-4">
                <a href="https://twitter.com/keetanetwork" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-sw-blue/30 flex items-center justify-center text-sw-blue/60 hover:text-sw-blue hover:border-sw-blue/60 transition-colors">
                  <span className="font-mono text-xs">X</span>
                </a>
                <a href="https://discord.gg/keeta" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-sw-blue/30 flex items-center justify-center text-sw-blue/60 hover:text-sw-blue hover:border-sw-blue/60 transition-colors">
                  <span className="font-mono text-xs">DC</span>
                </a>
                <a href="https://github.com/keeta" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-sw-blue/30 flex items-center justify-center text-sw-blue/60 hover:text-sw-blue hover:border-sw-blue/60 transition-colors">
                  <span className="font-mono text-xs">GH</span>
                </a>
              </div>
            </div>
            
            <div>
              <p className="font-display text-sm font-bold text-sw-blue mb-4 tracking-wider">PRODUCT</p>
              <div className="space-y-3">
                <Link to="/" className="block font-mono text-xs text-sw-blue/60 hover:text-sw-blue transition-colors">Launch App</Link>
                <a href="#features" className="block font-mono text-xs text-sw-blue/60 hover:text-sw-blue transition-colors">Features</a>
                <a href="#security" className="block font-mono text-xs text-sw-blue/60 hover:text-sw-blue transition-colors">Security</a>
                <a href="#faq" className="block font-mono text-xs text-sw-blue/60 hover:text-sw-blue transition-colors">FAQ</a>
              </div>
            </div>
            
            <div>
              <p className="font-display text-sm font-bold text-sw-blue mb-4 tracking-wider">RESOURCES</p>
              <div className="space-y-3">
                <a href="https://keeta.com" target="_blank" rel="noopener noreferrer" className="block font-mono text-xs text-sw-blue/60 hover:text-sw-blue transition-colors">Keeta Network</a>
                <a href="https://docs.keeta.com" target="_blank" rel="noopener noreferrer" className="block font-mono text-xs text-sw-blue/60 hover:text-sw-blue transition-colors">Documentation</a>
                <a href="https://keetascan.com" target="_blank" rel="noopener noreferrer" className="block font-mono text-xs text-sw-blue/60 hover:text-sw-blue transition-colors">Block Explorer</a>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-sw-blue/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-mono text-xs text-sw-blue/40">
              © {new Date().getFullYear()} YODA WALLET. ALL RIGHTS RESERVED.
            </p>
            <p className="font-mono text-xs text-sw-blue/40">
              POWERED BY KEETA NETWORK
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) => (
  <motion.div 
    className="p-4 border border-sw-blue/20 bg-sw-blue/5 backdrop-blur-sm"
    variants={fadeInUp}
    whileHover={{ borderColor: "rgba(77,166,255,0.4)", transition: { duration: 0.2 } }}
  >
    <div className="text-sw-blue/60 mb-2">{icon}</div>
    <p className="font-display text-2xl md:text-3xl font-bold text-sw-green mb-1">{value}</p>
    <p className="font-mono text-[10px] text-sw-blue/50 tracking-wider">{label}</p>
  </motion.div>
);

// Feature Card Component
const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  color: string;
}) => {
  const colorClasses: Record<string, { border: string; bg: string; text: string; hover: string }> = {
    green: { border: "border-sw-green/30", bg: "bg-sw-green/5", text: "text-sw-green", hover: "hover:border-sw-green/50 hover:bg-sw-green/10" },
    yellow: { border: "border-sw-yellow/30", bg: "bg-sw-yellow/5", text: "text-sw-yellow", hover: "hover:border-sw-yellow/50 hover:bg-sw-yellow/10" },
    blue: { border: "border-sw-blue/30", bg: "bg-sw-blue/5", text: "text-sw-blue", hover: "hover:border-sw-blue/50 hover:bg-sw-blue/10" },
    orange: { border: "border-sw-orange/30", bg: "bg-sw-orange/5", text: "text-sw-orange", hover: "hover:border-sw-orange/50 hover:bg-sw-orange/10" }
  };
  
  const styles = colorClasses[color] || colorClasses.blue;
  
  return (
    <motion.div 
      className={`relative p-6 border ${styles.border} ${styles.bg} ${styles.hover} transition-all group`}
      variants={fadeInUp}
    >
      <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-current opacity-30" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-current opacity-30" />
      
      <div className={`${styles.text} mb-4 group-hover:[filter:drop-shadow(0_0_10px_currentColor)] transition-all duration-300`}>
        {icon}
      </div>
      <h3 className="font-display text-lg font-bold text-sw-white mb-2 tracking-wider">{title}</h3>
      <p className="font-mono text-xs text-sw-blue/60 leading-relaxed">{description}</p>
    </motion.div>
  );
};

// Network Card Component
const NetworkCard = ({ 
  name, 
  description, 
  symbol, 
  color,
  features,
  primary
}: { 
  name: string; 
  description: string; 
  symbol: string; 
  color: string;
  features: string[];
  primary?: boolean;
}) => {
  const colorClasses: Record<string, { border: string; bg: string; text: string }> = {
    "sw-blue": { border: "border-sw-blue", bg: "bg-sw-blue", text: "text-sw-blue" },
    "sw-green": { border: "border-sw-green", bg: "bg-sw-green", text: "text-sw-green" }
  };
  
  const styles = colorClasses[color] || colorClasses["sw-blue"];
  
  return (
    <motion.div 
      className={`relative p-8 border ${styles.border}/30 bg-${color}/5 hover:border-${color}/60 transition-all ${primary ? 'md:-mt-4 md:mb-4' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {primary && (
        <div className={`absolute -top-3 left-6 px-3 py-1 ${styles.bg} text-sw-space font-mono text-[10px] tracking-wider`}>
          PRIMARY
        </div>
      )}
      <div className={`w-16 h-16 border ${styles.border}/60 ${styles.bg}/20 flex items-center justify-center mx-auto mb-4`}>
        <span className={`font-display text-2xl ${styles.text} font-bold`}>{symbol}</span>
      </div>
      <h3 className={`font-display text-xl font-bold ${styles.text} mb-2 text-center tracking-wider`}>{name}</h3>
      <p className="font-mono text-xs text-sw-blue/60 text-center mb-4">{description}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {features.map((feature, i) => (
          <span key={i} className={`px-2 py-1 ${styles.bg}/10 border ${styles.border}/20 font-mono text-[10px] ${styles.text}/80`}>
            {feature}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

// FAQ Item Component
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <motion.div 
      className="border border-sw-blue/20 bg-sw-blue/5"
      variants={fadeInUp}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-sw-blue/10 transition-colors"
      >
        <span className="font-display text-sm font-bold text-sw-white tracking-wider pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-sw-blue flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-5 pt-0">
          <p className="font-mono text-sm text-sw-blue/70 leading-relaxed">{answer}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Landing;