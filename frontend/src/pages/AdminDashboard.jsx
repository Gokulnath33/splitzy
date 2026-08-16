import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import api from "../utils/api";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("pending");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user || user.email !== "gokulnath2006mg@gmail.com") {
      navigate("/dashboard");
      return;
    }

    fetchData();
  }, [user, navigate]);

  const refreshData = async () => {
    try {
      const [pendingRes, approvedRes, historyRes] = await Promise.all([
        api.get("/auth/pending"),
        api.get("/auth/approved-users"),
        api.get("/auth/approvals")
      ]);
      setPendingUsers(pendingRes.data);
      setApprovedUsers(approvedRes.data);
      setApprovalHistory(historyRes.data);
    } catch (err) {
      addToast(err.response?.data?.message || "Error fetching data", "error");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await refreshData();
    setLoading(false);
  };

  const handleApprove = async (userId) => {
    setActionLoading(true);
    try {
      const { data } = await api.post(`/auth/approve/${userId}`, {});
      if (data.emailSent) {
        addToast("User approved! Confirmation email sent.", "success");
      } else {
        addToast("User approved, but email notification failed. Check spam folder.", "success");
      }
      await refreshData();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to approve user", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (userId) => {
    setActionLoading(true);
    try {
      await api.delete(`/auth/reject/${userId}`);
      addToast("User rejected and removed", "success");
      await refreshData();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to reject user", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-bg flex justify-center items-center h-screen">
        <p className="font-display text-xl text-gradient animate-pulse">Loading Admin Dashboard…</p>
      </div>
    );
  }

  return (
    <div className="dashboard-bg min-h-screen">
      <nav className="nav-glass flex items-center justify-between px-8 py-5">
        <Link to="/" className="font-display text-xl font-semibold text-gradient">
          splitzy
        </Link>
        <Link
          to="/dashboard"
          className="text-sm font-medium text-ink/60 hover:text-emerald hover:scale-105 transition-all duration-300"
        >
          ← Back to App
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <h1 className="font-display text-3xl font-semibold mb-8 text-gradient-violet text-ink">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8 border-b border-ink/10 pb-1">
          <button
            onClick={() => setActiveTab("pending")}
            className={`tab-btn ${activeTab === "pending" ? "tab-btn-active" : "tab-btn-inactive"}`}
          >
            Pending Approvals ({pendingUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`tab-btn ${activeTab === "approved" ? "tab-btn-active" : "tab-btn-inactive"}`}
          >
            Approved Users ({approvedUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`tab-btn ${activeTab === "history" ? "tab-btn-active" : "tab-btn-inactive"}`}
          >
            Approval History
          </button>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "pending" && (
            <div className="glass-card rounded-2xl p-6">
              {pendingUsers.length === 0 ? (
                <p className="text-ink-secondary text-center py-8">No pending users.</p>
              ) : (
                <ul className="divide-y divide-ink/20">
                  {pendingUsers.map((u) => (
                    <li key={u._id} className="py-4 flex flex-wrap justify-between items-center gap-4 table-row-hover rounded-xl px-2 -mx-2">
                      <div>
                        <p className="font-semibold text-ink">{u.name}</p>
                        <p className="text-sm text-ink-secondary">{u.email}</p>
                        <p className="text-xs text-ink-muted">
                          Registered: {new Date(u.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(u._id)}
                          disabled={actionLoading}
                          className="px-4 py-2 btn-gradient-primary text-white rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(u._id)}
                          disabled={actionLoading}
                          className="px-4 py-2 btn-gradient-coral text-white rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? "..." : "Reject"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "approved" && (
            <div className="glass-card rounded-2xl overflow-hidden">
              {approvedUsers.length === 0 ? (
                <p className="text-ink-secondary text-center py-8">No approved users yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-ink-secondary">
                    <thead className="bg-emerald/10 text-ink">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-ink">Name</th>
                        <th className="px-6 py-3 font-semibold text-ink">Email</th>
                        <th className="px-6 py-3 font-semibold text-ink">Joined</th>
                        <th className="px-6 py-3 font-semibold text-ink">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/20">
                      {approvedUsers.map((u) => {
                        const dateObj = new Date(u.createdAt);
                        return (
                          <tr key={u._id} className="table-row-hover">
                            <td className="px-6 py-4 font-medium text-ink">{u.name}</td>
                            <td className="px-6 py-4 text-ink-secondary">{u.email}</td>
                            <td className="px-6 py-4 text-ink-secondary">{dateObj.toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mint/30 text-emerald">
                                Active
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="glass-card rounded-2xl overflow-hidden">
              {approvalHistory.length === 0 ? (
                <p className="text-ink-secondary text-center py-8">No approval history available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-ink-secondary">
                    <thead className="bg-violet/10 text-ink">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-ink">Name</th>
                        <th className="px-6 py-3 font-semibold text-ink">Email</th>
                        <th className="px-6 py-3 font-semibold text-ink">Date</th>
                        <th className="px-6 py-3 font-semibold text-ink">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/20">
                      {approvalHistory.map((record) => {
                        const dateObj = new Date(record.createdAt);
                        return (
                          <tr key={record._id} className="table-row-hover">
                            <td className="px-6 py-4 font-medium text-ink">
                              {record.approvedUserName}
                            </td>
                            <td className="px-6 py-4 text-ink-secondary">{record.approvedUserEmail}</td>
                            <td className="px-6 py-4 text-ink-secondary">
                              {dateObj.toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-ink-secondary">
                              {dateObj.toLocaleTimeString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
