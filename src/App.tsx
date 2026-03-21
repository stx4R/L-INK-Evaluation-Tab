import { useStore } from './store/useStore';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';

function App() {
  // 스토어에서 로그인한 유저 정보를 가져옵니다.
  const currentUser = useStore((state) => state.currentUser);

  return (
    <>
      {/* 유저가 없으면 로그인 페이지를, 있으면 메인 대시보드를 보여줍니다. */}
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