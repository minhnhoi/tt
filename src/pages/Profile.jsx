import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button, Form, Modal, ProgressBar, Tab, Nav } from 'react-bootstrap';
import { getOne, patchOne } from '../services/api';
import { getLocalData, setLocalData } from '../utils/storage';

const defaultUser = {
  name: 'Người dùng',
  username: 'user',
  role: 'employee',
  email: '',
  phone: '',
  department: '',
  position: '',
  bio: '',
  joinedAt: '',
  avatar: null,
};

function Profile() {
  const savedUser = getLocalData('currentUser') || defaultUser;
  const [user, setUser] = useState(savedUser);
  const [form, setForm] = useState(savedUser);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [pwdErrors, setPwdErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadProfile() {
      if (!savedUser.id) return;
      try {
        setLoading(true);
        const freshUser = await getOne('/users', savedUser.id);
        const safeUser = { ...freshUser };
        delete safeUser.password;
        setUser(safeUser);
        setForm(safeUser);
        setLocalData('currentUser', safeUser);
      } catch {
        setToast({ type: 'danger', msg: 'Không tải được hồ sơ từ database.json. Hãy chạy npm run server.' });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const firstLetter = (user.name || user.username || 'U').charAt(0).toUpperCase();

  const completion = useMemo(() => {
    const fields = ['name', 'email', 'phone', 'department', 'position', 'bio', 'avatar'];
    const done = fields.filter((field) => user[field]).length;
    return Math.round((done / fields.length) * 100);
  }, [user]);

  const pwdStrength = useMemo(() => {
    const p = pwdForm.next || '';
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const labels = ['Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh', 'Rất mạnh'];
    const variants = ['danger', 'danger', 'warning', 'info', 'success', 'success'];
    return { percent: (score / 5) * 100, label: labels[score], variant: variants[score] };
  }, [pwdForm.next]);

  const startEdit = () => {
    setForm(user);
    setErrors({});
    setEditMode(true);
  };

  const cancelEdit = () => {
    setForm(user);
    setErrors({});
    setEditMode(false);
  };

  const validateProfile = () => {
    const nextErrors = {};
    if (!form.name?.trim()) nextErrors.name = 'Vui lòng nhập họ tên';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Email không hợp lệ';
    }
    if (form.phone && !/^[0-9+\-\s()]{6,20}$/.test(form.phone)) {
      nextErrors.phone = 'Số điện thoại không hợp lệ';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveProfile = async () => {
    if (!validateProfile()) return;

    if (!user.id) {
      setToast({ type: 'danger', msg: 'Tài khoản chưa có id nên không thể lưu vào fake server.' });
      return;
    }

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        email: form.email?.trim() || '',
        phone: form.phone?.trim() || '',
        department: form.department?.trim() || '',
        position: form.position?.trim() || '',
        bio: form.bio?.trim() || '',
      };
      const updated = await patchOne('/users', user.id, payload);
      const safeUser = { ...updated };
      delete safeUser.password;
      setUser(safeUser);
      setForm(safeUser);
      setLocalData('currentUser', safeUser);
      setEditMode(false);
      setToast({ type: 'success', msg: 'Đã lưu hồ sơ vào database.json' });
    } catch {
      setToast({ type: 'danger', msg: 'Lưu thất bại. Kiểm tra fake server đã chạy chưa.' });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast({ type: 'danger', msg: 'Vui lòng chọn file ảnh.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setToast({ type: 'danger', msg: 'Ảnh phải nhỏ hơn 2MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((prev) => ({ ...prev, avatar: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setForm((prev) => ({ ...prev, avatar: null }));
  };

  const openPwdModal = () => {
    setPwdForm({ current: '', next: '', confirm: '' });
    setPwdErrors({});
    setShowPwdModal(true);
  };

  const savePassword = async () => {
    const nextErrors = {};
    if (!pwdForm.current) nextErrors.current = 'Vui lòng nhập mật khẩu hiện tại';
    if (!pwdForm.next || pwdForm.next.length < 6) nextErrors.next = 'Mật khẩu mới phải từ 6 ký tự';
    if (pwdForm.next !== pwdForm.confirm) nextErrors.confirm = 'Mật khẩu xác nhận không khớp';

    if (Object.keys(nextErrors).length) {
      setPwdErrors(nextErrors);
      return;
    }

    try {
      const fullUser = await getOne('/users', user.id);
      if (fullUser.password !== pwdForm.current) {
        setPwdErrors({ current: 'Mật khẩu hiện tại không đúng' });
        return;
      }
      const updated = await patchOne('/users', user.id, { password: pwdForm.next });
      const safeUser = { ...updated };
      delete safeUser.password;
      setUser(safeUser);
      setLocalData('currentUser', safeUser);
      setShowPwdModal(false);
      setToast({ type: 'success', msg: 'Đã đổi mật khẩu trong database.json' });
    } catch {
      setPwdErrors({ submit: 'Đổi mật khẩu thất bại. Kiểm tra fake server đã chạy chưa.' });
    }
  };

  const displayUser = editMode ? form : user;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div>
          <h4 className="mb-1">Hồ sơ cá nhân</h4>
          <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
            Hồ sơ được đọc và cập nhật từ fake server database.json.
          </p>
        </div>
        <div className="d-flex gap-2">
          {!editMode ? (
            <>
              <Button variant="outline-secondary" size="sm" onClick={openPwdModal}>🔐 Đổi mật khẩu</Button>
              <Button variant="primary" size="sm" onClick={startEdit}>✏️ Chỉnh sửa</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={cancelEdit}>Hủy</Button>
              <Button variant="success" size="sm" onClick={saveProfile}>💾 Lưu vào server</Button>
            </>
          )}
        </div>
      </div>

      {loading && <div className="alert alert-info py-2">Đang tải hồ sơ từ server...</div>}
      {toast && <div className={`alert alert-${toast.type} py-2`}>{toast.msg}</div>}

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="position-relative d-inline-block mb-3">
                {displayUser.avatar ? (
                  <img
                    src={displayUser.avatar}
                    alt="Avatar"
                    className="rounded-circle border"
                    style={{ width: 120, height: 120, objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold mx-auto"
                    style={{ width: 120, height: 120, fontSize: 44 }}
                  >
                    {firstLetter}
                  </div>
                )}
              </div>

              <h5 className="mb-1">{displayUser.name || displayUser.username}</h5>
              <p className="text-muted mb-2">@{displayUser.username}</p>
              <Badge bg={displayUser.role === 'admin' ? 'danger' : 'secondary'}>
                {displayUser.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
              </Badge>

              <div className="mt-4 text-start">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted" style={{ fontSize: 13 }}>Hoàn thiện hồ sơ</span>
                  <strong style={{ fontSize: 13 }}>{completion}%</strong>
                </div>
                <ProgressBar now={completion} />
              </div>

              {editMode && (
                <div className="d-flex gap-2 justify-content-center mt-3">
                  <Button variant="outline-primary" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Đổi ảnh
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={removeAvatar}>
                    Xóa ảnh
                  </Button>
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <Tab.Container activeKey={activeTab} onSelect={(key) => setActiveTab(key || 'info')}>
                <Nav variant="tabs" className="mb-3">
                  <Nav.Item><Nav.Link eventKey="info">Thông tin</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="bio">Giới thiệu</Nav.Link></Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="info">
                    <div className="row g-3">
                      <Form.Group className="col-md-6">
                        <Form.Label>Họ tên</Form.Label>
                        <Form.Control
                          value={form.name || ''}
                          disabled={!editMode}
                          isInvalid={!!errors.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="col-md-6">
                        <Form.Label>Tên đăng nhập</Form.Label>
                        <Form.Control value={form.username || ''} disabled />
                      </Form.Group>

                      <Form.Group className="col-md-6">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          value={form.email || ''}
                          disabled={!editMode}
                          isInvalid={!!errors.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                        <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="col-md-6">
                        <Form.Label>Số điện thoại</Form.Label>
                        <Form.Control
                          value={form.phone || ''}
                          disabled={!editMode}
                          isInvalid={!!errors.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                        <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="col-md-6">
                        <Form.Label>Phòng ban</Form.Label>
                        <Form.Control
                          value={form.department || ''}
                          disabled={!editMode}
                          onChange={(e) => setForm({ ...form, department: e.target.value })}
                        />
                      </Form.Group>

                      <Form.Group className="col-md-6">
                        <Form.Label>Chức vụ</Form.Label>
                        <Form.Control
                          value={form.position || ''}
                          disabled={!editMode}
                          onChange={(e) => setForm({ ...form, position: e.target.value })}
                        />
                      </Form.Group>

                      <Form.Group className="col-md-6">
                        <Form.Label>Ngày tham gia</Form.Label>
                        <Form.Control
                          type="date"
                          value={form.joinedAt || ''}
                          disabled={!editMode}
                          onChange={(e) => setForm({ ...form, joinedAt: e.target.value })}
                        />
                      </Form.Group>
                    </div>
                  </Tab.Pane>

                  <Tab.Pane eventKey="bio">
                    <Form.Group>
                      <Form.Label>Giới thiệu bản thân</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={8}
                        value={form.bio || ''}
                        disabled={!editMode}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                        placeholder="Viết vài dòng giới thiệu..."
                      />
                    </Form.Group>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showPwdModal} onHide={() => setShowPwdModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Đổi mật khẩu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pwdErrors.submit && <div className="alert alert-danger py-2">{pwdErrors.submit}</div>}
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu hiện tại</Form.Label>
            <Form.Control
              type="password"
              value={pwdForm.current}
              isInvalid={!!pwdErrors.current}
              onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
            />
            <Form.Control.Feedback type="invalid">{pwdErrors.current}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu mới</Form.Label>
            <Form.Control
              type="password"
              value={pwdForm.next}
              isInvalid={!!pwdErrors.next}
              onChange={(e) => setPwdForm({ ...pwdForm, next: e.target.value })}
            />
            <Form.Control.Feedback type="invalid">{pwdErrors.next}</Form.Control.Feedback>
            <div className="mt-2">
              <ProgressBar now={pwdStrength.percent} variant={pwdStrength.variant} />
              <small className="text-muted">Độ mạnh: {pwdStrength.label}</small>
            </div>
          </Form.Group>

          <Form.Group>
            <Form.Label>Xác nhận mật khẩu mới</Form.Label>
            <Form.Control
              type="password"
              value={pwdForm.confirm}
              isInvalid={!!pwdErrors.confirm}
              onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
            />
            <Form.Control.Feedback type="invalid">{pwdErrors.confirm}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPwdModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={savePassword}>Lưu mật khẩu</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Profile;
