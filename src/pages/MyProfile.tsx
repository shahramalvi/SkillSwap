import { motion } from "framer-motion";
import { CheckCircle, Clock, Coins, Edit2, Inbox, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { SkillCard } from "../components/features/SkillCard";
import { TokenBadge } from "../components/features/TokenBadge";
import { Container } from "../components/layout/Container";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { useSkills } from "../hooks/useSkills";
import { useTransactions } from "../hooks/useTransactions";
import { useUsers } from "../hooks/useUsers";
import { useAuthStore } from "../store/authStore";
import type { Skill, Transaction } from "../types";
import { formatDate } from "../lib/utils";

export function MyProfile() {
  const user = useAuthStore((s) => s.user);
  const { updateUser } = useUsers();
  const { subscribeUserSkills, deleteSkill } = useSkills();
  const { subscribeMyTransactions, completeTransaction } = useTransactions();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) { setName(user.name); setBio(user.bio); }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubSkills = subscribeUserSkills(user.uid, setSkills);
    const unsubTx = subscribeMyTransactions((txs) => { setTransactions(txs); setLoading(false); });
    return () => { unsubSkills(); unsubTx?.(); };
  }, [user, subscribeUserSkills, subscribeMyTransactions]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUser(user.uid, { name, bio });
      toast.success("Profile updated");
      setEditing(false);
    } catch { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  const handleDeleteSkill = async (id: string) => {
    try { await deleteSkill(id); toast.success("Skill deleted"); }
    catch { toast.error("Failed to delete skill"); }
  };

  const handleComplete = async (txId: string) => {
    try { await completeTransaction(txId); toast.success("Completed! Tokens received."); }
    catch { toast.error("Failed to complete transaction"); }
  };

  if (!user) return null;

  return (
    <PageWrapper className="min-h-screen bg-canvas pb-20">
      {/* Header band */}
      <div className="bg-hero-gradient pt-24 pb-20 dot-pattern" />

      <Container className="-mt-16 space-y-8">

        {/* ── Profile card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-soft p-8"
        >
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar initials={user.avatar} size="xl" ring />
            <div className="flex-1">
              {editing ? (
                <div className="space-y-4 max-w-md">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-navy font-semibold text-xl focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="Tell people about yourself..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-navy text-sm placeholder:text-slate-400 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none resize-none transition-all"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={handleSave} disabled={saving} size="md">
                      {saving ? "Saving..." : "Save changes"}
                    </Button>
                    <Button variant="ghost" onClick={() => setEditing(false)} size="md">
                      <X size={16} className="mr-1 inline" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-extrabold text-navy">{user.name}</h1>
                      <p className="text-slate-500 text-sm mt-1">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal border border-slate-200 hover:border-teal rounded-xl px-3 py-2 transition-all"
                    >
                      <Edit2 size={13} /> Edit profile
                    </button>
                  </div>
                  <p className="text-slate-600 text-sm mt-3 max-w-xl leading-relaxed">
                    {user.bio || "No bio yet — add one to stand out!"}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <TokenBadge balance={user.tokenBalance} />
                    <Link
                      to="/requests"
                      className="text-xs font-semibold text-teal border border-teal/30 hover:bg-teal/10 rounded-full px-3 py-1 inline-flex items-center gap-1 transition-all"
                    >
                      <Inbox size={12} /> Manage requests
                    </Link>
                    <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-medium">
                      {skills.length} skill{skills.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-medium">
                      {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── My skills ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-navy">My skills</h2>
            <Link to="/post-skill">
              <Button variant="secondary" size="sm">
                <Plus size={15} className="mr-1 inline" /> Add skill
              </Button>
            </Link>
          </div>

          {skills.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center shadow-card">
              <Pencil size={36} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No skills yet</p>
              <p className="text-slate-400 text-sm mt-1 mb-5">Post your first skill to start receiving requests</p>
              <Link to="/post-skill">
                <Button variant="secondary" size="md">Post a skill</Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {skills.map((skill) => (
                <div key={skill.id}>
                  <SkillCard skill={skill} />
                  <div className="flex gap-2 mt-2">
                    <Button variant="ghost" size="sm" fullWidth>
                      <Edit2 size={13} className="mr-1 inline" /> Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      fullWidth
                      onClick={() => handleDeleteSkill(skill.id)}
                    >
                      <Trash2 size={13} className="mr-1 inline" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Transaction history ── */}
        <section>
          <h2 className="text-xl font-bold text-navy mb-5">Transaction history</h2>
          {loading ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : transactions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-card">
              <Clock size={36} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No transactions yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Party</th>
                      <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                      <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tokens</th>
                      <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((tx) => {
                      const isReceiver = tx.receiverId === user.uid;
                      const otherName = isReceiver ? tx.senderName : tx.receiverName;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-semibold text-navy">{otherName}</td>
                          <td className="p-4 text-slate-600 max-w-xs truncate">{tx.description}</td>
                          <td className="p-4">
                            <span className={`font-bold inline-flex items-center gap-1 ${isReceiver ? "text-teal" : "text-rose"}`}>
                              <Coins size={13} />
                              {isReceiver ? "+" : "−"}{tx.tokens}
                            </span>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={
                                tx.status === "completed" ? "teal"
                                : tx.status === "disputed" ? "danger"
                                : "navy"
                              }
                            >
                              {tx.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-slate-400 text-xs">{formatDate(tx.createdAt.toDate())}</td>
                          <td className="p-4">
                            {isReceiver && tx.status === "pending" && (
                              <button
                                type="button"
                                onClick={() => handleComplete(tx.id)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal bg-teal/10 hover:bg-teal hover:text-navy px-3 py-1.5 rounded-lg transition-all"
                              >
                                <CheckCircle size={12} /> Complete
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </Container>
    </PageWrapper>
  );
}
