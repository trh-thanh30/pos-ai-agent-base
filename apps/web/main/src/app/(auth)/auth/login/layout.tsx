import { Globe, Mail, MapPinned, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function SigninLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid md:grid-cols-[1fr_0.8fr] grid-cols-1 bg-gray-50/40 h-screen">
      <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-6  ">
        {children}
      </div>
      <div className="md:flex flex-col gap-2 items-center justify-center hidden  ">
        <Image
          width={500}
          height={500}
          src={'/phan-mem-ban-hang-tai-cua-hang.png'}
          alt="Phần mềm bán hàng tại cửa hàng NexPOS"
          className="object-cover w-xl h-xl select-none pointer-events-none"
        />
        <div className="rounded-full border-2 border-blue-500 p-1 shadow-md shadow-blue-100">
          <Image
            src={'/logo.png'}
            alt="NexPOS Logo"
            width={56}
            height={56}
            className="object-contain rounded-full select-none pointer-events-none"
          />
        </div>
        <div className="flex gap-2 flex-col text-xs mt-2">
          <h2 className="text-pos-blue-500 font-semibold uppercase">
            NexPOS – Nền tảng quản lý bán lẻ thông minh
          </h2>
          <span className="text-gray-500 flex items-center gap-2">
            <MapPinned size={14} /> Hà Nội, Việt Nam – Hỗ trợ vận hành đa chi nhánh toàn quốc
          </span>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 flex items-center gap-2">
              <Phone size={14} />
              1900 633 506
            </span>
            <span className="text-gray-500 flex items-center gap-2">
              <Mail size={14} />
              support@nexpos.vn
            </span>
          </div>
          <div className="text-gray-500 flex items-center gap-2 transition-colors duration-300">
            <Globe size={14} />
            Website:
            <Link href={'#'} className="hover:text-pos-blue-500 border-r border-r-gray-300 pr-2">
              nexpos.vn
            </Link>
            <Link className="hover:text-pos-blue-500" href={'#'}>
              docs.nexpos.vn
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
