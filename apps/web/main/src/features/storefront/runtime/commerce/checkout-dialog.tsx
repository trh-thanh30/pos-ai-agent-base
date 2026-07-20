"use client";

/* eslint-disable @next/next/no-img-element */
import type { FormEvent } from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";
import type { StorefrontConfig } from "../../config";
import type { StorefrontPayment, StorefrontStore } from "../types";
import { formatCurrency } from "../utils";

export interface CheckoutFormState {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNote: string;
  paymentMethod: "cod" | "bank_transfer";
}

interface CheckoutDialogProps {
  open: boolean;
  success: boolean;
  submitting: boolean;
  error: string;
  orderCode: string;
  cartTotal: number;
  config: StorefrontConfig;
  store: StorefrontStore;
  payment: StorefrontPayment | null;
  form: CheckoutFormState;
  onFormChange: (form: CheckoutFormState) => void;
  onSubmit: (event: FormEvent) => void;
  onClose: () => void;
  onDismiss: () => void;
}

export function CheckoutDialog({
  open,
  success,
  submitting,
  error,
  orderCode,
  cartTotal,
  config,
  store,
  payment,
  form,
  onFormChange,
  onSubmit,
  onClose,
  onDismiss,
}: CheckoutDialogProps) {
  if (!open) return null;
  const vietQrUrl =
    payment && orderCode
      ? `https://img.vietqr.io/image/${payment.bank_code}-${payment.bank_account_number}-compact2.png?amount=${cartTotal}&addInfo=${encodeURIComponent(`Thanh toan ${orderCode}`)}&accountName=${encodeURIComponent(payment.bank_account_name)}`
      : "";
  const patchForm = (patch: Partial<CheckoutFormState>) =>
    onFormChange({ ...form, ...patch });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
      <button
        className="absolute inset-0 bg-black/50"
        aria-label="Đóng thanh toán"
        onClick={() => !success && onDismiss()}
      />
      <div
        className="relative my-4 w-full max-w-lg bg-white shadow-2xl"
        style={{ borderRadius: "var(--sf-radius)" }}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-bold">
            {success ? "Đã ghi nhận yêu cầu" : "Thông tin đặt hàng"}
          </h2>
          <button
            aria-label="Đóng"
            onClick={onClose}
            className="grid size-10 place-items-center"
          >
            <X className="size-5" />
          </button>
        </div>
        {success ? (
          <div className="p-6 text-center">
            <CheckCircle2 className="mx-auto size-14 text-emerald-600" />
            <h3 className="mt-4 text-xl font-bold">
              Cảm ơn {form.customerName}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-black/55">
              {config.checkout.success_message}
            </p>
            <div className="mx-auto mt-4 w-fit bg-[var(--sf-bg)] px-4 py-2 text-sm">
              Mã tham chiếu: <strong>{orderCode}</strong>
            </div>
            {config.checkout.allow_bank_transfer && payment && vietQrUrl && (
              <div className="mt-6 border-t pt-6">
                <p className="mb-3 text-sm font-bold">
                  Chuyển khoản qua VietQR
                </p>
                <img
                  src={vietQrUrl}
                  alt="Mã QR chuyển khoản"
                  className="mx-auto size-56 object-contain"
                />
                <p className="mt-2 text-xs text-black/50">
                  {payment.bank_name} · {payment.bank_account_number}
                </p>
              </div>
            )}
            <button
              onClick={onClose}
              className="mt-6 h-11 w-full bg-[var(--sf-primary)] text-sm font-bold text-white"
              style={{ borderRadius: "var(--sf-radius)" }}
            >
              Hoàn tất
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4 p-6">
            <CheckoutInput
              label="Họ và tên"
              value={form.customerName}
              onChange={(customerName) => patchForm({ customerName })}
              required
            />
            <CheckoutInput
              label="Số điện thoại"
              type="tel"
              value={form.customerPhone}
              onChange={(customerPhone) => patchForm({ customerPhone })}
              required
            />
            {config.checkout.require_address && (
              <CheckoutInput
                label="Địa chỉ nhận hàng"
                value={form.customerAddress}
                onChange={(customerAddress) => patchForm({ customerAddress })}
                required
              />
            )}
            {config.checkout.allow_note && (
              <label className="grid gap-1.5 text-sm font-semibold">
                Ghi chú
                <textarea
                  value={form.customerNote}
                  onChange={(event) =>
                    patchForm({ customerNote: event.target.value })
                  }
                  rows={3}
                  className="resize-none border border-black/15 p-3 font-normal outline-none focus:border-[var(--sf-primary)]"
                  style={{ borderRadius: "var(--sf-radius)" }}
                />
              </label>
            )}
            {config.checkout.allow_cod &&
              config.checkout.allow_bank_transfer &&
              store.payment_methods?.bank_transfer && (
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold">
                    Thanh toán
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    <PaymentOption
                      active={form.paymentMethod === "cod"}
                      label="Khi nhận hàng"
                      onClick={() => patchForm({ paymentMethod: "cod" })}
                    />
                    <PaymentOption
                      active={form.paymentMethod === "bank_transfer"}
                      label="Chuyển khoản"
                      onClick={() =>
                        patchForm({ paymentMethod: "bank_transfer" })
                      }
                    />
                  </div>
                </fieldset>
              )}
            <div className="mt-2 flex items-center justify-between border-y border-black/10 py-4">
              <span className="text-sm text-black/55">Tổng đơn hàng</span>
              <strong className="text-lg">{formatCurrency(cartTotal)}</strong>
            </div>
            {error && (
              <p className="flex items-start gap-2 bg-red-50 p-3 text-xs leading-5 text-red-700">
                <CircleAlert className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="h-12 bg-[var(--sf-primary)] text-sm font-bold text-white disabled:opacity-60"
              style={{ borderRadius: "var(--sf-radius)" }}
            >
              {submitting ? "Đang tạo đơn..." : "Xác nhận đặt hàng"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function CheckoutInput({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      {label}
      {required && <span className="sr-only">Bắt buộc</span>}
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 border border-black/15 px-3 font-normal outline-none focus:border-[var(--sf-primary)]"
        style={{ borderRadius: "var(--sf-radius)" }}
      />
    </label>
  );
}

function PaymentOption({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 border text-xs font-bold transition ${
        active
          ? "border-[var(--sf-primary)] bg-[var(--sf-primary)]/5 text-[var(--sf-primary)]"
          : "border-black/12 text-black/55"
      }`}
      style={{ borderRadius: "var(--sf-radius)" }}
    >
      {label}
    </button>
  );
}
