import Header from '@/components/Header';
import LeftPanel from '@/components/LeftPanel';
import CenterPanel from '@/components/CenterPanel';
import RightPanel from '@/components/RightPanel';
import BottomBar from '@/components/BottomBar';
import AuthModal from '@/components/AuthModal';

export default function Dashboard() {
  return (
    <div className="flex flex-col h-screen bg-black text-gray-300 font-mono text-sm overflow-hidden">
      <AuthModal />
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel />
        <CenterPanel />
        <RightPanel />
      </div>
      <BottomBar />
    </div>
  );
}
