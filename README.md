# HRM System - Fake Server database.json

Project đã được sửa để chạy dữ liệu bằng `json-server` với file `database.json` ở thư mục gốc.

## Cách chạy

Cài thư viện:

```bash
npm install
```

Chạy fake server đọc `database.json`:

```bash
npm run server
```

Mở terminal thứ 2 để chạy React:

```bash
npm start
```

Hoặc chạy cả fake server và React cùng lúc:

```bash
npm run dev
```

## Tài khoản test

```txt
admin / 123456
nhanvien / 123456
```

## API fake server

Fake server mặc định chạy ở:

```txt
http://localhost:3001
```

Các endpoint chính:

```txt
/users
/employees
/departments
/attendance
/leaveRequests
/activities
```

Nếu muốn đổi API URL cho React, tạo file `.env`:

```txt
REACT_APP_API_URL=http://localhost:3001
```

## Các phần đã chuyển sang database.json

- Đăng nhập lấy tài khoản từ `/users`.
- Dashboard lấy thống kê từ server.
- Danh sách nhân viên lấy từ `/employees` và xóa bằng API.
- Chi tiết nhân viên lấy theo `/employees/:id`.
- Phòng ban thêm/sửa/xóa/xuất CSV và lưu vào `/departments`.
- Chấm công lọc theo ngày từ `/attendance`.
- Nghỉ phép duyệt/từ chối và lưu vào `/leaveRequests`.
- Hồ sơ cá nhân cập nhật thông tin và đổi mật khẩu trong `/users`.
