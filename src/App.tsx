import { useStore } from './store/useStore';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import AdminPage from './pages/AdminPage'; // ✨ 어드민 페이지 불러오기

function App() {
  const currentUser = useStore((state) => state.currentUser);

  // ✨ 현재 인터넷 주소가 '/admin'인지 확인해서, 맞으면 어드민 페이지를 바로 보여줍니다.
  if (window.location.pathname === '/admin') {
    return <AdminPage />;
  }

  return (
    <>
      {!currentUser ? (
        <Login />
      ) : (
        <Layout>
          <Dashboard />
        </Layout>
      )}
    </>
  );
}

export default App;