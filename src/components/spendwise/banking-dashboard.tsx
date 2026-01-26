"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  CreditCard,
  Landmark,
  MessageSquareText,
  PiggyBank,
  Plus,
  Wallet,
} from "lucide-react";
import AppHeader from "@/components/spendwise/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppData } from "@/hooks/use-app-data";
import { cn } from "@/lib/utils";

type BankingDashboardProps = {
  onLogout: () => void;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const parseBalanceFromText = (text: string) => {
  const match = text.replace(/,/g, "").match(/(?:\$|USD\\s?)(\\d+(?:\\.\\d{1,2})?)/i);
  if (!match) return undefined;
  const parsed = Number.parseFloat(match[1]);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export default function BankingDashboard({ onLogout }: BankingDashboardProps) {
  const {
    expenses,
    categories,
    addCategory,
    bankAccounts,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    smsMessages,
    addSmsMessage,
    deleteSmsMessage,
    liabilities,
    addLiability,
    deleteLiability,
  } = useAppData();

  const [accountForm, setAccountForm] = React.useState({
    name: "",
    institution: "",
    balance: "",
  });
  const [liabilityForm, setLiabilityForm] = React.useState({
    name: "",
    amount: "",
    dueDate: "",
    notes: "",
  });
  const [messageForm, setMessageForm] = React.useState({
    bankName: "",
    sender: "",
    body: "",
    detectedBalance: "",
  });
  const [selectedMessageIds, setSelectedMessageIds] = React.useState<string[]>([]);
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>("");

  const totalCash = React.useMemo(
    () => bankAccounts.reduce((sum, account) => sum + account.balance, 0),
    [bankAccounts]
  );
  const totalLiabilities = React.useMemo(
    () => liabilities.reduce((sum, item) => sum + item.amount, 0),
    [liabilities]
  );
  const lastThirtyDaysSpend = React.useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return expenses.reduce((sum, expense) => {
      const expenseDate = new Date(expense.date);
      if (expenseDate >= cutoff) {
        return sum + expense.amount;
      }
      return sum;
    }, 0);
  }, [expenses]);

  const cashAfterLiabilities = totalCash - totalLiabilities;
  const cashAfterLiabilitiesAndSpend = cashAfterLiabilities - lastThirtyDaysSpend;

  const handleAddAccount = () => {
    if (!accountForm.name.trim() || !accountForm.institution.trim() || !accountForm.balance) return;
    const balance = Number.parseFloat(accountForm.balance);
    if (Number.isNaN(balance)) return;
    addBankAccount({
      name: accountForm.name.trim(),
      institution: accountForm.institution.trim(),
      balance,
    });
    setAccountForm({ name: "", institution: "", balance: "" });
  };

  const handleAddLiability = () => {
    if (!liabilityForm.name.trim() || !liabilityForm.amount) return;
    const amount = Number.parseFloat(liabilityForm.amount);
    if (Number.isNaN(amount)) return;
    addLiability({
      name: liabilityForm.name.trim(),
      amount,
      dueDate: liabilityForm.dueDate ? new Date(liabilityForm.dueDate) : undefined,
      notes: liabilityForm.notes.trim() || undefined,
    });
    setLiabilityForm({ name: "", amount: "", dueDate: "", notes: "" });
  };

  const handleAddMessage = () => {
    if (!messageForm.bankName.trim() || !messageForm.sender.trim() || !messageForm.body.trim()) return;
    const explicitBalance = messageForm.detectedBalance
      ? Number.parseFloat(messageForm.detectedBalance)
      : undefined;
    const parsedBalance = parseBalanceFromText(messageForm.body);
    addSmsMessage({
      bankName: messageForm.bankName.trim(),
      sender: messageForm.sender.trim(),
      body: messageForm.body.trim(),
      detectedBalance: Number.isNaN(explicitBalance ?? Number.NaN)
        ? parsedBalance
        : explicitBalance,
    });
    setMessageForm({ bankName: "", sender: "", body: "", detectedBalance: "" });
  };

  const handleToggleMessage = (messageId: string, checked: boolean) => {
    setSelectedMessageIds((prev) => {
      if (checked) {
        return [...prev, messageId];
      }
      return prev.filter((id) => id !== messageId);
    });
  };

  const handleApplyMessage = () => {
    if (!selectedAccountId || selectedMessageIds.length === 0) return;
    const message = smsMessages.find((item) => item.id === selectedMessageIds[0]);
    const account = bankAccounts.find((item) => item.id === selectedAccountId);
    if (!message || !account) return;
    const balance = message.detectedBalance ?? parseBalanceFromText(message.body);
    if (balance === undefined) return;
    updateBankAccount({
      ...account,
      balance,
      updatedAt: new Date(),
      lastMessageId: message.id,
    });
  };

  const handleClearSelection = () => {
    setSelectedMessageIds([]);
  };

  const selectedMessage = smsMessages.find((item) => item.id === selectedMessageIds[0]);

  return (
    <>
      <AppHeader
        categories={categories}
        onCategoryAdd={addCategory}
        onLogout={onLogout}
        showPlannerSettings={false}
      />
      <main className="container mx-auto grid gap-8 px-4 py-8 lg:grid-cols-3 lg:px-8">
        <section className="grid gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5" />
                Bank Accounts
              </CardTitle>
              <CardDescription>Track your balances and keep them synced from bank SMS alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Input
                  placeholder="Account name"
                  value={accountForm.name}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <Input
                  placeholder="Bank or institution"
                  value={accountForm.institution}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, institution: event.target.value }))}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Balance"
                  value={accountForm.balance}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, balance: event.target.value }))}
                />
              </div>
              <Button type="button" onClick={handleAddAccount} className="w-full md:w-auto">
                <Plus className="h-4 w-4" />
                Add bank account
              </Button>
              <div className="grid gap-4 md:grid-cols-2">
                {bankAccounts.map((account) => (
                  <Card key={account.id} className="border-muted">
                    <CardContent className="flex flex-col gap-3 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{account.institution}</p>
                          <p className="text-lg font-semibold">{account.name}</p>
                        </div>
                        <Wallet className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs uppercase text-muted-foreground">Balance</p>
                        <p className="text-2xl font-bold text-foreground">
                          {currencyFormatter.format(account.balance)}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Updated {format(account.updatedAt, "MMM d, yyyy 'at' h:mm a")}
                      </div>
                      {account.lastMessageId && (
                        <p className="text-xs text-muted-foreground">
                          Synced from SMS {account.lastMessageId.slice(0, 6)}
                        </p>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => deleteBankAccount(account.id)}
                        className="self-start"
                      >
                        Remove account
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {bankAccounts.length === 0 && (
                <p className="text-sm text-muted-foreground">Add your first bank account to start tracking balances.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareText className="h-5 w-5" />
                Bank SMS Inbox
              </CardTitle>
              <CardDescription>
                Paste your bank text alerts and select which one to apply to an account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="Bank name"
                  value={messageForm.bankName}
                  onChange={(event) => setMessageForm((prev) => ({ ...prev, bankName: event.target.value }))}
                />
                <Input
                  placeholder="Sender or shortcode"
                  value={messageForm.sender}
                  onChange={(event) => setMessageForm((prev) => ({ ...prev, sender: event.target.value }))}
                />
              </div>
              <Textarea
                placeholder="Paste the bank SMS text here"
                value={messageForm.body}
                onChange={(event) => setMessageForm((prev) => ({ ...prev, body: event.target.value }))}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Detected balance (optional)"
                  value={messageForm.detectedBalance}
                  onChange={(event) => setMessageForm((prev) => ({ ...prev, detectedBalance: event.target.value }))}
                />
                <Button type="button" onClick={handleAddMessage} className="w-full md:w-auto">
                  <Plus className="h-4 w-4" />
                  Add message
                </Button>
              </div>

              <div className="grid gap-3">
                {smsMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3",
                      selectedMessageIds.includes(message.id) && "border-primary/60 bg-primary/5"
                    )}
                  >
                    <Checkbox
                      checked={selectedMessageIds.includes(message.id)}
                      onCheckedChange={(value) => handleToggleMessage(message.id, Boolean(value))}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{message.bankName}</p>
                          <p className="text-xs text-muted-foreground">From {message.sender}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(message.receivedAt, "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{message.body}</p>
                      <p className="text-xs text-muted-foreground">
                        Balance detected:{" "}
                        {message.detectedBalance !== undefined
                          ? currencyFormatter.format(message.detectedBalance)
                          : "Not detected"}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSmsMessage(message.id)}
                        className="px-0 text-destructive"
                      >
                        Delete message
                      </Button>
                    </div>
                  </div>
                ))}
                {smsMessages.length === 0 && (
                  <p className="text-sm text-muted-foreground">No SMS alerts yet. Add your first message above.</p>
                )}
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-dashed p-4">
                <p className="text-sm font-semibold">Apply selected SMS to a bank account</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.institution} — {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-col gap-2">
                    <Button type="button" onClick={handleApplyMessage} disabled={!selectedAccountId || selectedMessageIds.length === 0}>
                      Sync balance from SMS
                    </Button>
                    <Button type="button" variant="ghost" onClick={handleClearSelection} disabled={selectedMessageIds.length === 0}>
                      Clear selection
                    </Button>
                  </div>
                </div>
                {selectedMessage && (
                  <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                    Selected message from {selectedMessage.bankName}. Detected balance:{" "}
                    {selectedMessage.detectedBalance !== undefined
                      ? currencyFormatter.format(selectedMessage.detectedBalance)
                      : "Not detected, paste a balance or update the text"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5" />
                Forecast Snapshot
              </CardTitle>
              <CardDescription>See what is available after bills and recent spending.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-muted p-4">
                <p className="text-xs uppercase text-muted-foreground">Cash on hand</p>
                <p className="text-2xl font-semibold">{currencyFormatter.format(totalCash)}</p>
              </div>
              <div className="rounded-lg border border-muted p-4">
                <p className="text-xs uppercase text-muted-foreground">Liabilities</p>
                <p className="text-2xl font-semibold text-destructive">
                  {currencyFormatter.format(totalLiabilities)}
                </p>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs uppercase text-muted-foreground">Available after liabilities</p>
                <p className="text-2xl font-semibold">{currencyFormatter.format(cashAfterLiabilities)}</p>
              </div>
              <div className="rounded-lg border border-muted p-4">
                <p className="text-xs uppercase text-muted-foreground">Last 30 days expenses</p>
                <p className="text-2xl font-semibold">{currencyFormatter.format(lastThirtyDaysSpend)}</p>
                <p className="text-xs text-muted-foreground">
                  Forecast after expenses: {currencyFormatter.format(cashAfterLiabilitiesAndSpend)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Liabilities
              </CardTitle>
              <CardDescription>Track bills and debts that reduce your available cash.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Input
                  placeholder="Liability name"
                  value={liabilityForm.name}
                  onChange={(event) => setLiabilityForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={liabilityForm.amount}
                  onChange={(event) => setLiabilityForm((prev) => ({ ...prev, amount: event.target.value }))}
                />
                <Input
                  type="date"
                  value={liabilityForm.dueDate}
                  onChange={(event) => setLiabilityForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                />
                <Textarea
                  placeholder="Notes (optional)"
                  value={liabilityForm.notes}
                  onChange={(event) => setLiabilityForm((prev) => ({ ...prev, notes: event.target.value }))}
                />
                <Button type="button" onClick={handleAddLiability} className="w-full">
                  Add liability
                </Button>
              </div>

              <div className="space-y-3">
                {liabilities.map((liability) => (
                  <div key={liability.id} className="rounded-lg border border-muted p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{liability.name}</p>
                      <span className="text-sm font-semibold text-destructive">
                        {currencyFormatter.format(liability.amount)}
                      </span>
                    </div>
                    {liability.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        Due {format(liability.dueDate, "MMM d, yyyy")}
                      </p>
                    )}
                    {liability.notes && (
                      <p className="text-xs text-muted-foreground">{liability.notes}</p>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="px-0 text-destructive"
                      onClick={() => deleteLiability(liability.id)}
                    >
                      Remove liability
                    </Button>
                  </div>
                ))}
                {liabilities.length === 0 && (
                  <p className="text-sm text-muted-foreground">Add liabilities to refine your forecast.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </>
  );
}
