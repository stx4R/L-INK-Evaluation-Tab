import { useStore } from './store/useStore';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import AdminPage from './pages/AdminPage';

function App() {
  const currentUser = useStore((state) => state.currentUser);

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