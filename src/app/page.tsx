import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import FileGrid from '@/components/FileGrid';

export default function Home() {
  return (
    <main style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, backgroundColor: '#f7f9fc' }}>
        <Sidebar />
        <FileGrid />
      </div>
    </main>
  );
}
