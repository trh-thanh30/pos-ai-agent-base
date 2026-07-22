"use client";

import { useState, useEffect } from "react";
import { X, User, Lock, Mail, Phone, LogIn, UserPlus, CheckCircle2 } from "lucide-react";
import type { StorefrontTheme } from "../types";

export interface CustomerUser {
  name: string;
  phone: string;
  email?: string;
}

interface AuthDialogProps {
  open: boolean;
  theme: StorefrontTheme;
  user: CustomerUser | null;
  onClose: () => void;
  onLoginSuccess: (user: CustomerUser) => void;
  onLogout: () => void;
}

export function StorefrontAuthDialog({
  open,
  theme,
  user,
  onClose,
  onLoginSuccess,
  onLogout,
}: AuthDialogProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (open) {
      setError("");
      setSuccessMsg("");
    }
  }, [open]);

  if (!open) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }
    const loggedUser: CustomerUser = {
      name: loginPhone.trim().length > 8 ? `Khách hàng (${loginPhone.slice(-4)})` : "Khách hàng thân thiết",
      phone: loginPhone.trim(),
    };
    onLoginSuccess(loggedUser);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) {
      setError("Vui lòng điền họ tên và số điện thoại");
      return;
    }
    const newUser: CustomerUser = {
      name: regName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim() || undefined,
    };
    setSuccessMsg("Đăng ký thành công!");
    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Đóng cửa sổ"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-md overflow-hidden bg-white shadow-2xl transition-all"
        style={{ borderRadius: theme.radius }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-full bg-[var(--sf-primary)]/10 text-[var(--sf-primary)]">
              <User className="size-4" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Tài khoản khách hàng</h2>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-gray-400 hover:bg-gray-200/60 hover:text-gray-600"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {user ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-3 grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="size-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Xin chào, {user.name}!</h3>
              <p className="mt-1 text-sm text-gray-500">SĐT: {user.phone}</p>
              {user.email && <p className="text-sm text-gray-500">Email: {user.email}</p>}

              <button
                onClick={onLogout}
                className="mt-6 w-full rounded-lg border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                Đăng xuất tài khoản
              </button>
            </div>
          ) : (
            <>
              {/* Tab Selector */}
              <div className="mb-6 flex border-b border-gray-200">
                <button
                  onClick={() => {
                    setTab("login");
                    setError("");
                  }}
                  className={`flex-1 pb-3 text-sm font-bold transition-colors ${
                    tab === "login"
                      ? "border-b-2 border-[var(--sf-primary)] text-[var(--sf-primary)]"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => {
                    setTab("register");
                    setError("");
                  }}
                  className={`flex-1 pb-3 text-sm font-bold transition-colors ${
                    tab === "register"
                      ? "border-b-2 border-[var(--sf-primary)] text-[var(--sf-primary)]"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Đăng ký mới
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="size-4" />
                  {successMsg}
                </div>
              )}

              {tab === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        placeholder="Nhập số điện thoại mua hàng"
                        className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-[var(--sf-primary)] focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Mật khẩu (không bắt buộc)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-[var(--sf-primary)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--sf-primary)] py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    <LogIn className="size-4" /> Đăng nhập
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Họ và tên *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-[var(--sf-primary)] focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Số điện thoại *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="0912 345 678"
                        className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-[var(--sf-primary)] focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Email (tùy chọn)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-[var(--sf-primary)] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Tạo mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-[var(--sf-primary)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--sf-primary)] py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    <UserPlus className="size-4" /> Đăng ký tài khoản
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
