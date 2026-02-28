import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ToastContainer from '../ui/Toast';

export default function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f1f5f9', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Outlet />
      </div>
      <ToastContainer />
    </div>
  );
}
