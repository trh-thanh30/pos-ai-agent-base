"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  InfoConfigPayment,
  InfoRewardPoint,
  InfoStore,
  InfoOnlineStore,
} from "../components";

const link = [
  {
    title: "Thông tin cửa hàng",
    link: "store-info?tab=store",
  },
  {
    title: "Cấu hình Website",
    link: "store-info?tab=online",
  },
  {
    title: "Thông tin tích điểm",
    link: "store-info?tab=reward",
  },
  {
    title: "Thông tin thanh toán",
    link: "store-info?tab=payment",
  },
];
export function InfoStoreViewV2() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab");

  useEffect(() => {
    if (!tab) {
      router.push("store-info?tab=store");
    }
  }, [router, tab]);

  return (
    <div className="grid h-full grid-cols-1 gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="h-full w-full bg-white flex flex-col gap-3 p-4 rounded-md text-nowrap">
        {link.map((item, index) => (
          <Link
            href={item.link}
            key={index}
            className={`text-base font-semibold text-gray-800 hover:text-pos-blue-500 hover:bg-pos-blue-50 py-2 px-3 cursor-pointer  transition-all duration-300 ${
              tab === item.link.split("=")[1]
                ? "bg-pos-blue-50 text-pos-blue-500"
                : ""
            }`}
          >
            {item.title}
          </Link>
        ))}
      </div>
      <div
        className={`h-full min-w-0 w-full rounded-md ${
          tab === "online" ? "p-0 overflow-y-auto bg-[#f3f5f5]" : "p-8 overflow-y-auto bg-white"
        }`}
      >
        {tab === "store" && <InfoStore />}
        {tab === "online" && <InfoOnlineStore />}
        {tab === "reward" && <InfoRewardPoint />}
        {tab === "payment" && <InfoConfigPayment tab={tab} />}
      </div>
    </div>
  );
}
