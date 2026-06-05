import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getList } from '../services/api';
import { setLocalData } from '../utils/storage';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      const users = await getList('/users', {
        username: username.trim(),
        password: password.trim(),
      });

      const found = users[0];
      if (!found) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng.');
        return;
      }

      const safeUser = { ...found };
      delete safeUser.password;
      setLocalData('currentUser', safeUser);
      navigate('/dashboard');
    } catch {
      setError('Không kết nối được fake server. Hãy chạy: npm run server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="col-md-4 col-sm-8 col-11">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h4 className="text-center text-primary mb-1">HRM System</h4>
            <p className="text-center text-muted mb-4" style={{ fontSize: '13px' }}>
              Hệ thống quản lý nhân sự dùng fake server database.json
            </p>

            {error && (
              <div className="alert alert-danger py-2" style={{ fontSize: '13px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '13px' }}>Tên đăng nhập</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                />
              </div>

              <div className="mb-4">
                <label className="form-label" style={{ fontSize: '13px' }}>Mật khẩu</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: '12px' }}>
              Tài khoản test trong database.json: admin / 123456 hoặc nhanvien / 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
