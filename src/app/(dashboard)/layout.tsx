import Sidebar from "@/components/sidebar";
import { Toaster } from "@/components/ui/toaster";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      
      <Sidebar />

      <div className="flex-1 bg-gray-100 p-6">
        {children}
        <Toaster/>
      </div>
    </div>
  );
}
