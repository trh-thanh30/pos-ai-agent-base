"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { LandingSection, SectionHeader } from "./LandingSection";

const items = [
  {
    question: "NexPOS phù hợp với cửa hàng nhỏ hay chuỗi bán lẻ?",
    answer:
      "Phù hợp cả hai. Cửa hàng nhỏ có thể bắt đầu với bán hàng, kho và khách hàng cơ bản. Khi mở rộng nhiều chi nhánh, hệ thống hỗ trợ phân quyền, báo cáo tập trung và kiểm soát vận hành theo từng điểm bán.",
  },
  {
    question: "Có cần thay đổi toàn bộ quy trình hiện tại không?",
    answer:
      "Không cần. Bạn có thể triển khai theo từng bước: bán hàng tại quầy, quản lý kho, khách hàng, sau đó mở rộng sang báo cáo chuỗi, phân quyền và AI assistant.",
  },
  {
    question: "NexPOS có hỗ trợ hóa đơn điện tử từ máy tính tiền không?",
    answer:
      "Có. Hệ thống hỗ trợ quy trình hóa đơn, lưu chứng từ và đồng bộ dữ liệu bán hàng để đội vận hành dễ đối soát.",
  },
  {
    question: "Dữ liệu giữa các chi nhánh được quản lý thế nào?",
    answer:
      "Dữ liệu được gom về một nơi, nhưng vẫn có thể phân quyền theo vai trò, chi nhánh và nghiệp vụ để nhân sự chỉ thấy phần mình cần xử lý.",
  },
  {
    question: "Có dùng được trên điện thoại và tablet không?",
    answer:
      "Có. Landing và các luồng quản trị được tối ưu responsive, phù hợp cho chủ cửa hàng theo dõi từ xa hoặc nhân sự thao tác trên thiết bị tại quầy.",
  },
  {
    question: "Có thể dùng thử trước khi triển khai không?",
    answer:
      "Có. Bạn có thể đăng ký dùng thử hoặc nhận demo theo mô hình cửa hàng/chuỗi của mình trước khi chọn gói phù hợp.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <LandingSection id="support">
      <SectionHeader
        eyebrow="FAQ"
        title="Những câu hỏi thường gặp trước khi triển khai"
        description="Nếu bạn đang cân nhắc chuyển từ bảng tính, phần mềm cũ hoặc quy trình thủ công, đây là các điểm đội vận hành thường hỏi nhất."
      />

      <div className="mx-auto mt-10 max-w-4xl space-y-3">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `faq-panel-${index}`;

          return (
            <div
              key={item.question}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 sm:px-6"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
              >
                <span className="text-base font-bold text-slate-950 sm:text-lg">
                  {item.question}
                </span>
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition ${
                    isOpen ? "bg-pos-blue-500 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </span>
              </button>

              <div
                id={panelId}
                className={`grid transition-[grid-template-rows] duration-300 ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <p className="px-5 pb-5 leading-7 text-slate-600 sm:px-6">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </LandingSection>
  );
}
