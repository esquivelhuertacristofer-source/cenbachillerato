import { DocenteHeader } from '@/components/dashboard/DocenteHeader';

export default function DocenteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <DocenteHeader />
      {children}
    </div>
  );
}
