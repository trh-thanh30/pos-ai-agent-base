import DashboardLayout from '../../../../main/src/layouts/dashboard-layout';
export default function DashLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
