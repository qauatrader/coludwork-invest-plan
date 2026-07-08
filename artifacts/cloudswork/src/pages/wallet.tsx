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
import { Wallet, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle, Paperclip, Image, X } from "lucide-react";
import { useSearch } from "wouter";

function StatusBadge({ status }: { status: string }) {
  const config = {
    pending: { icon: Clock, class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    approved: { icon: CheckCircle, class: "bg-primary/10 text-primary border-primary/20" },
    completed: { icon: CheckCircle, class: "bg-primary/10 text-primary border-primary/20" },
    rejected: { icon: XCircle, class: "bg-red-500/10 text-red-400 border-red-500/20" },
    failed: { icon: XCircle, class: "bg-red-500/10 text-red-400 border-red-500/20" },
  }[status] || { icon: Clock, class: "bg-secondary text-muted-foreground border-border" };
  const Icon = config.icon;
  return (
    <Badge className={`${config.class} flex items-center gap-1 capitalize`}>
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
        toast({ title: "Deposit submitted!", description: "Your deposit is under review" });
        setAmount(""); setMethod(""); setSlipFile(null); setSlipPreview(null);
        queryClient.invalidateQueries({ queryKey: getGetDepositsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Failed", description: err?.data?.error || "Deposit failed", variant: "destructive" });
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
    <div className="space-y-4">
      {selectedMethod && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Send payment to:</p>
          <p className="font-semibold text-foreground">{selectedMethod.name}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{selectedMethod.accountTitle}</p>
          <p className="text-primary font-mono text-sm mt-1 break-all">{selectedMethod.accountNumber}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-sm">Payment Method</Label>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="bg-secondary/50">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            {methods?.map(m => (
              <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Amount (PKR)</Label>
        <Input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground">Minimum deposit: Rs. {minDeposit.toLocaleString()}</p>
      </div>

      {/* Deposit Slip Upload */}
      <div className="space-y-1.5">
        <Label className="text-sm">Payment Slip (screenshot/receipt)</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {slipPreview ? (
          <div className="relative rounded-xl overflow-hidden border border-primary/30 bg-secondary/30">
            <img src={slipPreview} alt="Payment slip" className="w-full max-h-48 object-contain" />
            <button
              type="button"
              onClick={() => { setSlipFile(null); setSlipPreview(null); }}
              className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            <Paperclip className="w-5 h-5" />
            <span className="text-xs">Tap to attach payment slip</span>
            <span className="text-xs opacity-60">PNG, JPG up to 5MB</span>
          </button>
        )}
      </div>

      <Button
        className="w-full bg-primary hover:bg-primary/90"
        onClick={handleSubmit}
        disabled={!amount || !method || createDeposit.isPending}
      >
        {createDeposit.isPending ? "Submitting..." : "Submit Deposit"}
      </Button>

      <div className="mt-4">
        <DepositHistory />
      </div>
    </div>
  );
}

function DepositHistory() {
  const { data: deposits, isLoading } = useGetDeposits();
  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-2">Deposit History</h3>
      <div className="space-y-2">
        {isLoading ? Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />) :
          deposits?.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No deposits yet</p> :
          deposits?.map(d => (
            <div key={d.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Rs.{d.amount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{d.paymentMethod} • {new Date(d.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                {d.voucherUrl && (
                  <a href={d.voucherUrl} target="_blank" rel="noopener noreferrer" title="View slip">
                    <Image className="w-4 h-4 text-primary" />
                  </a>
                )}
                <StatusBadge status={d.status} />
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
        toast({ title: "Withdrawal requested!", description: "Your request is under review" });
        setAmount(""); setWalletType(""); setAccountTitle(""); setIban("");
        queryClient.invalidateQueries({ queryKey: getGetWithdrawalsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Failed", description: err?.data?.error || "Withdrawal failed", variant: "destructive" });
      },
    },
  });

  const amt = parseFloat(amount) || 0;
  const fee = amt * (feePercent / 100);
  const net = amt - fee;

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs text-muted-foreground">Available Balance</p>
        <p className="text-2xl font-bold text-primary">
          Rs.{(wallet?.withdrawBalance || 0).toLocaleString()}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Withdrawal Method</Label>
        <Select value={walletType} onValueChange={setWalletType}>
          <SelectTrigger className="bg-secondary/50">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jazzcash">JazzCash</SelectItem>
            <SelectItem value="easypaisa">EasyPaisa</SelectItem>
            <SelectItem value="bank">Bank Transfer</SelectItem>
            <SelectItem value="usdt_trc20">USDT TRC20</SelectItem>
            <SelectItem value="usdt_bep20">USDT BEP20</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Account Title / Name</Label>
        <Input
          placeholder="Account holder name"
          value={accountTitle}
          onChange={e => setAccountTitle(e.target.value)}
          className="bg-secondary/50"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Account Number / IBAN / Address</Label>
        <Input
          placeholder="Enter account details"
          value={iban}
          onChange={e => setIban(e.target.value)}
          className="bg-secondary/50"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Amount (PKR)</Label>
        <Input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground">Min: Rs. {minWithdrawal.toLocaleString()} • Fee: {feePercent}%</p>
      </div>

      {amt > 0 && (
        <div className="bg-secondary/50 rounded-xl p-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span>Rs.{amt.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fee ({feePercent}%)</span>
            <span className="text-red-400">-Rs.{fee.toFixed(0)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-border pt-1">
            <span>You receive</span>
            <span className="text-primary">Rs.{net.toFixed(0)}</span>
          </div>
        </div>
      )}

      <Button
        className="w-full bg-primary hover:bg-primary/90"
        onClick={() => createWithdrawal.mutate({
          data: { amount: amt, walletType, accountTitle, iban }
        })}
        disabled={!amount || !walletType || !accountTitle || !iban || createWithdrawal.isPending}
      >
        {createWithdrawal.isPending ? "Processing..." : "Request Withdrawal"}
      </Button>

      <WithdrawHistory />
    </div>
  );
}

function WithdrawHistory() {
  const { data: withdrawals, isLoading } = useGetWithdrawals();
  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-2">Withdrawal History</h3>
      <div className="space-y-2">
        {isLoading ? Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />) :
          withdrawals?.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No withdrawals yet</p> :
          withdrawals?.map(w => (
            <div key={w.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Rs.{w.amount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{w.walletType} • {new Date(w.createdAt).toLocaleDateString()}</p>
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
    commission: "text-yellow-400", purchase: "text-red-400", bonus: "text-green-400",
  };

  return (
    <div className="space-y-2">
      {isLoading ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />) :
        data?.transactions?.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No transactions yet</p>
          </div>
        ) :
        data?.transactions?.map(tx => (
          <div key={tx.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-secondary ${types[tx.type] || "text-muted-foreground"}`}>
              {["deposit", "profit", "commission", "bonus"].includes(tx.type)
                ? <ArrowDownCircle className="w-4 h-4" />
                : <ArrowUpCircle className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground capitalize">{tx.type}</p>
              <p className="text-xs text-muted-foreground truncate">{tx.description}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${["deposit","profit","commission","bonus","refund"].includes(tx.type) ? "text-primary" : "text-red-400"}`}>
                {["deposit","profit","commission","bonus","refund"].includes(tx.type) ? "+" : "-"}Rs.{tx.amount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))
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
      <div className="max-w-lg mx-auto px-4 pt-4 pb-4">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-foreground">Wallet</h1>
          <p className="text-sm text-muted-foreground">Manage your funds</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: "Deposit Balance", value: wallet?.depositBalance, icon: ArrowDownCircle, color: "text-blue-400 bg-blue-500/10" },
            { label: "Withdraw Balance", value: wallet?.withdrawBalance, icon: ArrowUpCircle, color: "text-orange-400 bg-orange-500/10" },
            { label: "Profit Balance", value: wallet?.profitBalance, icon: Wallet, color: "text-primary bg-primary/10" },
            { label: "Commission", value: wallet?.commissionBalance, icon: Wallet, color: "text-yellow-400 bg-yellow-500/10" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs text-muted-foreground">{label}</p>
              {isLoading ? <Skeleton className="h-5 w-20 mt-1" /> :
                <p className="text-sm font-bold text-foreground">Rs.{(value || 0).toLocaleString()}</p>}
            </div>
          ))}
        </div>

        <Tabs defaultValue={tab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="deposit" className="flex-1">
              <ArrowDownCircle className="w-4 h-4 mr-1.5" /> Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex-1">
              <ArrowUpCircle className="w-4 h-4 mr-1.5" /> Withdraw
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              <Clock className="w-4 h-4 mr-1.5" /> History
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
