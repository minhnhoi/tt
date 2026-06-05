import { NavLink } from 'react-router-dom';

const menuItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Nhân viên', path: '/employees' },
  { label: 'Phòng ban', path: '/departments' },
  { label: 'Chấm công', path: '/attendance' },
  { label: 'Nghỉ phép', path: '/leave' },
  { label: 'Hồ sơ cá nhân', path: '/profile' },
  { label: 'Giới thiệu nhóm', path: '/about-team' },
];

function Sidebar() {
  return (
    <div
      className="bg-light border-end"
      style={{ width: '200px', minHeight: '100vh' }}
    >
      <ul className="nav flex-column pt-2">
        {menuItems.map((item) => (
          <li key={item.path} className="nav-item">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                'nav-link px-3 py-2' +
                (isActive
                  ? ' active bg-primary text-white'
                  : ' text-dark')
              }
              style={{ fontSize: '14px', borderRadius: 0 }}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
