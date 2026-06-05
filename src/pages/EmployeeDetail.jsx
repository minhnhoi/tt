import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOne } from '../services/api';

function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEmployee() {
      try {
        setLoading(true);
        setError('');
        const data = await getOne('/employees', id);
        setEmployee(data);
      } catch {
        setError('Không tìm thấy nhân viên hoặc fake server chưa chạy.');
      } finally {
        setLoading(false);
      }
    }

    loadEmployee();
  }, [id]);

  if (loading) {
    return <div className="text-center py-5 text-muted">Đang tải hồ sơ nhân viên...</div>;
  }

  if (error || !employee) {
    return (
      <div className="text-center py-5">
        <h5 className="text-danger">Lỗi: Không tìm thấy hồ sơ!</h5>
        <p className="text-muted">{error || 'Nhân viên này không tồn tại hoặc đã bị xóa.'}</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/employees')}>
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  const rows = [
    { label: 'Họ tên', value: employee.name },
    { label: 'Phòng ban', value: employee.department },
    { label: 'Chức vụ', value: employee.position },
    { label: 'Trạng thái', value: employee.status },
    { label: 'Email', value: employee.email },
    { label: 'Số điện thoại', value: employee.phone },
    { label: 'Ngày vào làm', value: employee.joinDate },
  ];

  return (
    <div>
      <button className="btn btn-link text-decoration-none p-0 mb-3" onClick={() => navigate('/employees')}>
        ← Quay lại danh sách
      </button>

      <h4 className="mb-1">Hồ sơ Nhân viên</h4>
      <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
        Thông tin chi tiết của <strong>{employee.name}</strong> lấy từ database.json (ID: #{id})
      </p>

      <div className="card shadow-sm border-0" style={{ maxWidth: '600px' }}>
        <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
          <div className="d-flex align-items-center">
            <div
              className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-3"
              style={{ width: '60px', height: '60px', fontSize: '24px', fontWeight: 'bold' }}
            >
              {employee.name.charAt(0)}
            </div>
            <div>
              <h5 className="mb-0">{employee.name}</h5>
              <span className="text-muted">{employee.position}</span>
            </div>
          </div>
        </div>

        <div className="card-body mt-3">
          <table className="table table-borderless mb-0">
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-bottom">
                  <th className="text-muted" style={{ width: '160px', fontSize: '15px' }}>
                    {row.label}
                  </th>
                  <td className="fw-medium" style={{ fontSize: '15px' }}>
                    {row.value || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDetail;
