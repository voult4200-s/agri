import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Smartphone, Building2, Banknote, CheckCircle2,
  ShieldCheck, ArrowRight, Loader2, IndianRupee, Copy, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  description: string;
  onSuccess?: () => void;
}

const paymentMethods: { id: PaymentMethod; label: string; icon: typeof CreditCard; desc: string }[] = [
  { id: "upi", label: "UPI", icon: Smartphone, desc: "GPay, PhonePe, Paytm" },
  { id: "card", label: "Card", icon: CreditCard, desc: "Credit / Debit Card" },
  { id: "netbanking", label: "Net Banking", icon: Building2, desc: "All major banks" },
  { id: "cod", label: "Cash on Delivery", icon: Banknote, desc: "Pay when you receive" },
];

const banks = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Bank of Baroda", "Punjab National Bank"];

export default function PaymentDialog({ open, onOpenChange, amount, description, onSuccess }: PaymentDialogProps) {
  const [step, setStep] = useState<"select" | "details" | "processing" | "success">("select");
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("");

  const reset = () => {
    setStep("select");
    setMethod(null);
    setUpiId("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
    setSelectedBank("");
  };

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const handlePay = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        toast.success("Payment successful!", { description: `₹${amount.toLocaleString("en-IN")} paid via ${paymentMethods.find(m => m.id === method)?.label}` });
        onSuccess?.();
        handleClose(false);
      }, 2000);
    }, 2500);
  };

  const canProceed = () => {
    if (!method) return false;
    if (method === "upi") return upiId.includes("@");
    if (method === "card") return cardNumber.length >= 16 && cardExpiry.length >= 5 && cardCvv.length >= 3 && cardName.length > 0;
    if (method === "netbanking") return selectedBank.length > 0;
    if (method === "cod") return true;
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Header with amount */}
        <div className="gradient-hero p-5 text-primary-foreground">
          <DialogHeader>
            <DialogTitle className="text-primary-foreground font-heading text-lg">
              {step === "success" ? "Payment Successful" : "Complete Payment"}
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/70 text-sm">
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <IndianRupee className="w-6 h-6" />
              <span className="font-mono text-3xl font-bold">{amount.toLocaleString("en-IN")}</span>
            </div>
            <Badge className="bg-white/20 text-primary-foreground border-0 gap-1">
              <ShieldCheck className="w-3 h-3" /> Secure
            </Badge>
          </div>
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {/* Step 1: Select Method */}
            {step === "select" && (
              <motion.div key="select" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <p className="text-sm font-medium text-foreground mb-2">Choose Payment Method</p>
                {paymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => { setMethod(pm.id); setStep("details"); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:border-primary/50 hover:bg-primary/5 ${
                      method === pm.id ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <pm.icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium text-sm text-foreground">{pm.label}</p>
                      <p className="text-xs text-muted-foreground">{pm.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </motion.div>
            )}

            {/* Step 2: Payment Details */}
            {step === "details" && method && (
              <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <button onClick={() => setStep("select")} className="text-xs text-primary flex items-center gap-1 hover:underline">
                  ← Change payment method
                </button>

                {method === "upi" && (
                  <div className="space-y-3">
                    <Label>UPI ID</Label>
                    <Input placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                    <div className="flex gap-2">
                      {["@ybl", "@paytm", "@oksbi"].map(suffix => (
                        <button key={suffix} onClick={() => setUpiId(prev => prev.split("@")[0] + suffix)}
                          className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                          {suffix}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {method === "card" && (
                  <div className="space-y-3">
                    <div>
                      <Label>Card Number</Label>
                      <Input placeholder="1234 5678 9012 3456" value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))} />
                    </div>
                    <div>
                      <Label>Cardholder Name</Label>
                      <Input placeholder="Name on card" value={cardName}
                        onChange={(e) => setCardName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Expiry</Label>
                        <Input placeholder="MM/YY" value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.replace(/[^\d/]/g, "").slice(0, 5))} />
                      </div>
                      <div>
                        <Label>CVV</Label>
                        <Input type="password" placeholder="•••" value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} />
                      </div>
                    </div>
                  </div>
                )}

                {method === "netbanking" && (
                  <div className="space-y-3">
                    <Label>Select Your Bank</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {banks.map(bank => (
                        <button key={bank} onClick={() => setSelectedBank(bank)}
                          className={`p-3 rounded-xl border-2 text-xs text-left transition-all ${
                            selectedBank === bank ? "border-primary bg-primary/5 text-foreground font-medium" : "border-border text-muted-foreground hover:border-primary/30"
                          }`}>
                          <Building2 className="w-4 h-4 mb-1" />
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {method === "cod" && (
                  <div className="bg-muted rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                      <Banknote className="w-4 h-4 text-success" /> Cash on Delivery
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pay ₹{amount.toLocaleString("en-IN")} in cash when your order is delivered. Please keep exact change ready.
                    </p>
                    <p className="text-xs text-warning">Note: A ₹{Math.round(amount * 0.02).toLocaleString("en-IN")} convenience fee may apply.</p>
                  </div>
                )}

                <Button
                  onClick={handlePay}
                  disabled={!canProceed()}
                  className="w-full gradient-hero text-primary-foreground border-0 hover:opacity-90 h-12 text-sm font-semibold"
                >
                  Pay ₹{amount.toLocaleString("en-IN")} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 256-bit SSL Encrypted · Your payment info is secure
                </p>
              </motion.div>
            )}

            {/* Step 3: Processing */}
            {step === "processing" && (
              <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <IndianRupee className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-sm font-medium text-foreground">Processing your payment...</p>
                <p className="text-xs text-muted-foreground">Please don't close this window</p>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 space-y-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                  <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-success" />
                  </div>
                </motion.div>
                <div className="text-center">
                  <p className="font-heading font-bold text-lg text-foreground">Payment Successful!</p>
                  <p className="text-sm text-muted-foreground mt-1">₹{amount.toLocaleString("en-IN")} paid successfully</p>
                </div>
                <div className="bg-muted rounded-lg px-4 py-2 text-xs text-muted-foreground font-mono">
                  TXN: KG{Date.now().toString(36).toUpperCase()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
