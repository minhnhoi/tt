import { useEffect, useMemo, useState } from 'react';
import { getList } from '../services/api';
import { getLocalData } from '../utils/storage';

function Dashboard() {
  const currentUser = getLocalData('currentUser');
  const name = currentUser ? currentUser.name || currentUser.username : 'bạn';
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError('');
        const [empData, depData, leaveData, attendanceData] = await Promise.all([
          getList('/employees'),
          getList('/departments'),
          getList('/leaveRequests'),
          getList('/attendance'),
        ]);
        setEmployees(empData);
        setDepartments(depData);
        setLeaveRequests(leaveData);
        setAttendance(attendanceData);
      } catch {
        setError('Không tải được dữ liệu. Hãy bật fake server bằng lệnh: npm run server');
      }
    }

    loadDashboard();
  }, []);

  const latestDate = useMemo(() => {
    if (!attendance.length) return '';
    return [...new Set(attendance.map((item) => item.date))].sort().pop();
  }, [attendance]);

  const stats = [
    { label: 'Tổng nhân viên', value: employees.length, colorClass: 'text-primary' },
    { label: 'Phòng ban', value: departments.length, colorClass: 'text-success' },
    {
      label: 'Đang nghỉ phép',
      value: leaveRequests.filter((item) => item.status === 'Đã duyệt').length,
      colorClass: 'text-warning',
    },
    {
      label: latestDate ? `Chấm công ${latestDate}` : 'Chấm công gần nhất',
      value: latestDate ? attendance.filter((item) => item.date === latestDate).length : 0,
      colorClass: 'text-info',
    },
  ];

  const recentActivity = [
    `Fake server đang đọc dữ liệu từ database.json với ${employees.length} nhân viên.`,
    `${departments.length} phòng ban đang được quản lý trong hệ thống.`,
    `${leaveRequests.filter((item) => item.status === 'Chờ duyệt').length} đơn nghỉ phép đang chờ duyệt.`,
    latestDate ? `Dữ liệu chấm công gần nhất: ${latestDate}.` : 'Chưa có dữ liệu chấm công.',
  ];

  return (
    <div>
      <h4 className="mb-1">Dashboard</h4>
      <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
        Xin chào, <strong>{name}</strong>! Đây là tổng quan hệ thống lấy từ fake server.
      </p>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="row g-3 mb-4">
        {stats.map((stat) => (
          <div key={stat.label} className="col-sm-6 col-md-3">
            <div className="card h-100">
              <div className="card-body">
                <p className="text-muted mb-1" style={{ fontSize: '13px' }}>{stat.label}</p>
                <p className={`fw-bold mb-0 fs-3 ${stat.colorClass}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header bg-white fw-semibold">Hoạt động gần đây</div>
        <ul className="list-group list-group-flush">
          {recentActivity.map((item, i) => (
            <li key={i} className="list-group-item" style={{ fontSize: '14px' }}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
