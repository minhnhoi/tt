import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteOne, getList } from '../services/api';

function statusBadge(status) {
  if (status === 'Đang làm') return <span className="badge bg-success">{status}</span>;
  if (status === 'Nghỉ phép') return <span className="badge bg-warning text-dark">{status}</span>;
  return <span className="badge bg-secondary">{status}</span>;
}

function Employees() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadEmployees() {
    try {
      setLoading(true);
      setError('');
      const data = await getList('/employees');
      setEmployees(data);
    } catch {
      setError('Không tải được danh sách nhân viên. Hãy chạy fake server: npm run server');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhân viên này khỏi database.json?')) return;

    try {
      await deleteOne('/employees', id);
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch {
      alert('Xóa thất bại. Kiểm tra lại fake server đã chạy chưa.');
    }
  };

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h4 className="mb-1">Danh sách Nhân viên</h4>
      <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
        Quản lý thông tin và trạng thái toàn bộ nhân sự từ fake server.
      </p>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="row mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Tìm kiếm theo tên hoặc phòng ban..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-auto mt-2 mt-md-0">
          <button className="btn btn-outline-secondary" onClick={loadEmployees}>
            Tải lại dữ liệu
          </button>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <table className="table table-bordered table-striped table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="text-center">STT</th>
                <th>Họ tên</th>
                <th>Phòng ban</th>
                <th>Chức vụ</th>
                <th className="text-center">Trạng thái</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">Đang tải dữ liệu...</td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((emp, index) => (
                  <tr key={emp.id} className="align-middle">
                    <td className="text-center">{index + 1}</td>
                    <td className="fw-medium">{emp.name}</td>
                    <td>{emp.department}</td>
                    <td>{emp.position}</td>
                    <td className="text-center">{statusBadge(emp.status)}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => navigate(`/employees/${emp.id}`)}
                      >
                        Xem
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(emp.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    Không tìm thấy nhân viên nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Employees;
