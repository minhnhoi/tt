import { useEffect, useState } from 'react';
import { getList } from '../services/api';

function statusBadge(status) {
  if (status === 'Đúng giờ') return <span className="badge bg-success">{status}</span>;
  if (status === 'Đi muộn') return <span className="badge bg-warning text-dark">{status}</span>;
  if (status === 'Nghỉ phép') return <span className="badge bg-secondary">{status}</span>;
  return <span className="badge bg-danger">{status}</span>;
}

function formatDateForDisplay(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

function Attendance() {
  const [selectedDate, setSelectedDate] = useState('2026-05-22');
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAttendance() {
      try {
        setLoading(true);
        setError('');
        const data = await getList('/attendance', { date: selectedDate });
        setAttendance(data);
      } catch {
        setError('Không tải được dữ liệu chấm công. Hãy chạy fake server: npm run server');
      } finally {
        setLoading(false);
      }
    }

    loadAttendance();
  }, [selectedDate]);

  return (
    <div>
      <h4 className="mb-1">Chấm công</h4>
      <p className="text-muted mb-3" style={{ fontSize: '14px' }}>
        Theo dõi thời gian ra vào của nhân viên từ database.json.
      </p>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="row mb-3">
        <div className="col-md-3">
          <div className="d-flex align-items-center gap-2">
            <label className="form-label mb-0 text-nowrap">Ngày:</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <table className="table table-bordered table-striped table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>STT</th>
                <th>Họ tên</th>
                <th>Ngày</th>
                <th>Giờ vào</th>
                <th>Giờ ra</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">Đang tải dữ liệu...</td>
                </tr>
              ) : attendance.length > 0 ? (
                attendance.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{row.name}</td>
                    <td>{formatDateForDisplay(row.date)}</td>
                    <td>{row.checkIn}</td>
                    <td>{row.checkOut}</td>
                    <td>{statusBadge(row.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    Không có dữ liệu chấm công cho ngày này.
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

export default Attendance;
