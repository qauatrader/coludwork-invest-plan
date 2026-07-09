import { useState, useRef } from "react";
import { useGetWallet, useGetDeposits, useGetWithdrawals, useGetTransactions, useGetPaymentMethods, useGetWalletSettings, useCreateDeposit, useCreateWithdrawal } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetWalletQueryKey, getGetDepositsQueryKey, getGetWithdrawalsQueryKey, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { Wallet, ArrowDownRight, ArrowUpRight, Clock, CheckCircle2, XCircle, Paperclip, Image as ImageIcon, X } from "lucide-react";
import { useSearch } from "wouter";

function StatusBadge({ status }: { status: string }) {
  const config = {
    pending: { icon: Clock, class: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
    approved: { icon: CheckCircle2, class: "text-primary bg-primary/10 border-primary/20" },
    completed: { icon: CheckCircle2, class: "text-primary bg-primary/10 border-primary/20" },
    rejected: { icon: XCircle, class: "text-red-400 bg-red-500/10 border-red-500/20" },
    failed: { icon: XCircle, class: "text-red-400 bg-red-500/10 border-red-500/20" },
  }[status] || { icon: Clock, class: "text-muted-foreground bg-secondary border-border" };
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`${config.class} flex items-center gap-1.5 px-2.5 py-0.5 rounded-full capitalize text-[10px] tracking-wider font-semibold`}>
      <Icon className="w-3 h-3" /> {status}
    </Badge>
  );
}

function DepositTab() {
  const { data: methods } = useGetPaymentMethods();
  const { data: settings } = useGetWalletSettings();
  const minDeposit = settings?.minDeposit ?? 0;
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createDeposit = useCreateDeposit({
    mutation: {
      onSuccess: () => {
        toast({ title: "Funds Transferred", description: "Your deposit is pending verification" });
        setAmount(""); setMethod(""); setSlipFile(null); setSlipPreview(null);
        queryClient.invalidateQueries({ queryKey: getGetDepositsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Transfer Failed", description: err?.data?.error || "Unable to process deposit", variant: "destructive" });
      },
    },
  });

  const selectedMethod = methods?.find(m => m.id === parseInt(method));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB allowed", variant: "destructive" });
      return;
    }
    setSlipFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setSlipPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!amount || !method) return;
    if (slipPreview) {
      createDeposit.mutate({
        data: {
          amount: parseFloat(amount),
          currency: "PKR",
          paymentMethod: selectedMethod?.type || method,
          voucherUrl: slipPreview,
        },
      });
    } else {
      createDeposit.mutate({
        data: {
          amount: parseFloat(amount),
          currency: "PKR",
          paymentMethod: selectedMethod?.type || method,
        },
      });
    }
  };

  return (
    <div className="space-y-6 animate-stagger-2">
      {selectedMethod && (
        <div className="glass-card rounded-2xl p-5 border border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/80 font-semibold mb-1">Transfer Destination</p>
          <p className="font-serif text-lg font-semibold text-foreground tracking-tight">{selectedMethod.name}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{selectedMethod.accountTitle}</p>
          <p className="text-primary font-mono text-base font-medium mt-2 break-all bg-background/50 inline-block px-3 py-1 rounded-lg border border-primary/10">{selectedMethod.accountNumber}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Payment Method</Label>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="bg-background/50 border-foreground/10 h-12 rounded-xl focus:ring-primary/20">
            <SelectValue placeholder="Select funding source" />
          </SelectTrigger>
          <SelectContent>
            {methods?.map(m => (
              <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Amount (PKR)</Label>
        <Input
          type="number"
          placeholder="Enter transfer amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="bg-background/50 border-foreground/10 h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 font-medium"
        />
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Minimum required: Rs. {minDeposit.toLocaleString()}</p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Payment Receipt</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {slipPreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-primary/30 bg-background/50 p-2">
            <img src={slipPreview} alt="Receipt" className="w-full max-h-48 object-contain rounded-xl" />
            <button
              type="button"
              onClick={() => { setSlipFile(null); setSlipPreview(null); }}
              className="absolute top-4 right-4 w-8 h-8 bg-background/80 backdrop-blur-md rounded-full flex items-center justify-center text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors border border-foreground/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border border-dashed border-white/20 bg-background/30 rounded-2xl p-6 flex flex-col items-center gap-3 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Paperclip className="w-5 h-5 text-primary" />
            </div>
            <div className="text-center">
              <span className="text-sm font-medium block text-foreground">Attach Receipt Image</span>
              <span className="text-[10px] uppercase tracking-wider opacity-60 mt-1 block">JPG, PNG under 5MB</span>
            </div>
          </button>
        )}
      </div>

      <Button
        className="w-full h-12 rounded-xl vip-gradient text-background font-bold text-sm tracking-widest uppercase shadow-xl hover:shadow-primary/20 hover:scale-[0.98] transition-all duration-300 border-none"
        onClick={handleSubmit}
        disabled={!amount || !method || createDeposit.isPending}
      >
        {createDeposit.isPending ? "Processing..." : "Initiate Transfer"}
      </Button>

      <div className="pt-6 border-t border-foreground/5">
        <DepositHistory />
      </div>
    </div>
  );
}

function DepositHistory() {
  const { data: deposits, isLoading } = useGetDeposits();
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Transfer History</h3>
      <div className="space-y-3">
        {isLoading ? Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl bg-secondary" />) :
          deposits?.length === 0 ? <p className="text-sm text-muted-foreground/60 text-center py-6 font-medium">No prior transfers</p> :
          deposits?.map(d => (
            <div key={d.id} className="glass-card border border-foreground/5 rounded-2xl p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4 text-blue-400" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground tracking-tight">Rs. {d.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{d.paymentMethod} • {new Date(d.createdAt).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={d.status} />
                {d.voucherUrl && (
                  <a href={d.voucherUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-wider text-primary hover:underline flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> View Receipt
                  </a>
                )}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function WithdrawTab() {
  const { data: wallet } = useGetWallet();
  const { data: settings } = useGetWalletSettings();
  const minWithdrawal = settings?.minWithdrawal ?? 0;
  const feePercent = settings?.withdrawalFeePercent ?? 2;
  const [amount, setAmount] = useState("");
  const [walletType, setWalletType] = useState("");
  const [accountTitle, setAccountTitle] = useState("");
  const [iban, setIban] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createWithdrawal = useCreateWithdrawal({
    mutation: {
      onSuccess: () => {
        toast({ title: "Withdrawal Requested", description: "Funds will be dispatched after review" });
        setAmount(""); setWalletType(""); setAccountTitle(""); setIban("");
        queryClient.invalidateQueries({ queryKey: getGetWithdrawalsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Request Failed", description: err?.data?.error || "Withdrawal failed", variant: "destructive" });
      },
    },
  });

  const amt = parseFloat(amount) || 0;
  const fee = amt * (feePercent / 100);
  const net = amt - fee;

  return (
    <div className="space-y-6 animate-stagger-2">
      <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
        <p className="text-xs uppercase tracking-widest text-muted-foreground/80 font-semibold mb-2 relative z-10">Available Liquidity</p>
        <p className="text-4xl font-serif font-semibold vip-text-gradient tracking-tight relative z-10">
          Rs. {(wallet?.withdrawBalance || 0).toLocaleString()}
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Destination Method</Label>
        <Select value={walletType} onValueChange={setWalletType}>
          <SelectTrigger className="bg-background/50 border-foreground/10 h-12 rounded-xl focus:ring-primary/20">
            <SelectValue placeholder="Select destination" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank">Bank Transfer (Preferred)</SelectItem>
            <SelectItem value="jazzcash">JazzCash</SelectItem>
            <SelectItem value="easypaisa">EasyPaisa</SelectItem>
            <SelectItem value="usdt_trc20">USDT TRC20</SelectItem>
            <SelectItem value="usdt_bep20">USDT BEP20</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Account Holder</Label>
        <Input
          placeholder="Legal name on account"
          value={accountTitle}
          onChange={e => setAccountTitle(e.target.value)}
          className="bg-background/50 border-foreground/10 h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 font-medium"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Account ID / IBAN</Label>
        <Input
          placeholder="Identifier or address"
          value={iban}
          onChange={e => setIban(e.target.value)}
          className="bg-background/50 border-foreground/10 h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 font-medium"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Withdrawal Amount</Label>
        <Input
          type="number"
          placeholder="Amount in PKR"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="bg-background/50 border-foreground/10 h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 text-lg font-semibold text-primary"
        />
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Min: Rs. {minWithdrawal.toLocaleString()} • Fee: {feePercent}%</p>
      </div>

      {amt > 0 && (
        <div className="bg-secondary/40 border border-foreground/5 rounded-2xl p-4 space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Gross Amount</span>
            <span className="font-medium text-foreground">Rs. {amt.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Service Fee ({feePercent}%)</span>
            <span className="font-medium text-red-400">- Rs. {fee.toFixed(0)}</span>
          </div>
          <div className="flex justify-between items-center border-t border-foreground/10 pt-2 mt-2">
            <span className="text-xs uppercase tracking-widest text-foreground font-bold">Net Disbursement</span>
            <span className="font-serif text-lg font-bold text-primary">Rs. {net.toFixed(0)}</span>
          </div>
        </div>
      )}

      <Button
        className="w-full h-12 rounded-xl vip-gradient text-background font-bold text-sm tracking-widest uppercase shadow-xl hover:shadow-primary/20 hover:scale-[0.98] transition-all duration-300 border-none"
        onClick={() => createWithdrawal.mutate({
          data: { amount: amt, walletType, accountTitle, iban }
        })}
        disabled={!amount || !walletType || !accountTitle || !iban || createWithdrawal.isPending}
      >
        {createWithdrawal.isPending ? "Processing..." : "Request Disbursement"}
      </Button>

      <div className="pt-6 border-t border-foreground/5">
        <WithdrawHistory />
      </div>
    </div>
  );
}

function WithdrawHistory() {
  const { data: withdrawals, isLoading } = useGetWithdrawals();
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Disbursement History</h3>
      <div className="space-y-3">
        {isLoading ? Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl bg-secondary" />) :
          withdrawals?.length === 0 ? <p className="text-sm text-muted-foreground/60 text-center py-6 font-medium">No prior disbursements</p> :
          withdrawals?.map(w => (
            <div key={w.id} className="glass-card border border-foreground/5 rounded-2xl p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-orange-400" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground tracking-tight">Rs. {w.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{w.walletType} • {new Date(w.createdAt).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</p>
                </div>
              </div>
              <StatusBadge status={w.status} />
            </div>
          ))
        }
      </div>
    </div>
  );
}

function HistoryTab() {
  const { data, isLoading } = useGetTransactions({ page: 1 });
  const types: Record<string, string> = {
    deposit: "text-blue-400", withdrawal: "text-orange-400", profit: "text-primary",
    commission: "text-primary", purchase: "text-foreground/60", bonus: "text-primary",
  };
  const bgTypes: Record<string, string> = {
    deposit: "bg-blue-500/10 border-blue-500/20", withdrawal: "bg-orange-500/10 border-orange-500/20", profit: "bg-primary/10 border-primary/20",
    commission: "bg-primary/10 border-primary/20", purchase: "bg-foreground/5 border-foreground/10", bonus: "bg-primary/10 border-primary/20",
  };

  return (
    <div className="space-y-3 animate-stagger-2">
      {isLoading ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl bg-secondary" />) :
        data?.transactions?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground glass-card rounded-[1.5rem]">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-serif text-lg text-foreground">No Ledger Entries</p>
            <p className="text-xs mt-1">Your transaction history will appear here.</p>
          </div>
        ) :
        data?.transactions?.map(tx => {
          const isPositive = ["deposit", "profit", "commission", "bonus", "refund"].includes(tx.type);
          return (
            <div key={tx.id} className="glass-card border border-foreground/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-foreground/5 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${bgTypes[tx.type] || "bg-secondary border-foreground/5"}`}>
                {isPositive ? <ArrowDownRight className={`w-4 h-4 ${types[tx.type] || "text-muted-foreground"}`} strokeWidth={2} />
                            : <ArrowUpRight className={`w-4 h-4 ${types[tx.type] || "text-muted-foreground"}`} strokeWidth={2} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground capitalize tracking-tight">{tx.type}</p>
                <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5">{tx.description}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold tracking-tight ${isPositive ? "text-foreground" : "text-foreground/60"}`}>
                  {isPositive ? "+" : "-"}Rs. {tx.amount.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mt-0.5">
                  {new Date(tx.createdAt).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                </p>
              </div>
            </div>
          );
        })
      }
    </div>
  );
}

export default function WalletPage() {
  const { data: wallet, isLoading } = useGetWallet();
  const search = useSearch();
  const tab = new URLSearchParams(search).get("tab") || "deposit";

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-5 pt-8 pb-6">
        <div className="mb-6 animate-stagger-1">
          <h1 className="text-3xl font-serif font-semibold text-foreground tracking-tight">Ledger</h1>
          <p className="text-sm text-muted-foreground/80 tracking-wide mt-1">Manage your liquidity and distributions</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6 animate-stagger-1">
          {[
            { label: "Deposit Balance", value: wallet?.depositBalance, icon: ArrowDownRight, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
            { label: "Withdraw Balance", value: wallet?.withdrawBalance, icon: ArrowUpRight, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
            { label: "Profit Balance", value: wallet?.profitBalance, icon: Wallet, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
            { label: "Commission", value: wallet?.commissionBalance, icon: Wallet, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="glass-card rounded-2xl p-4 relative overflow-hidden group">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 border ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} strokeWidth={2} />
              </div>
              <p className="text-[10px] text-muted-foreground/80 uppercase tracking-widest font-semibold">{label}</p>
              {isLoading ? <Skeleton className="h-6 w-24 mt-1 bg-secondary" /> :
                <p className="text-lg font-serif font-semibold text-foreground mt-1 tracking-tight">Rs. {(value || 0).toLocaleString()}</p>}
            </div>
          ))}
        </div>

        <Tabs defaultValue={tab} className="animate-stagger-2">
          <TabsList className="w-full mb-6 bg-secondary/50 p-1.5 rounded-xl border border-foreground/5 h-auto">
            <TabsTrigger value="deposit" className="flex-1 py-2.5 rounded-lg text-[10px] font-semibold tracking-widest uppercase data-[state=active]:bg-card data-[state=active]:text-primary transition-all">
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex-1 py-2.5 rounded-lg text-[10px] font-semibold tracking-widest uppercase data-[state=active]:bg-card data-[state=active]:text-primary transition-all">
              Withdraw
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 py-2.5 rounded-lg text-[10px] font-semibold tracking-widest uppercase data-[state=active]:bg-card data-[state=active]:text-primary transition-all">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="mt-0"><DepositTab /></TabsContent>
          <TabsContent value="withdraw" className="mt-0"><WithdrawTab /></TabsContent>
          <TabsContent value="history" className="mt-0"><HistoryTab /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
