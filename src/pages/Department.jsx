import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Form, Modal } from 'react-bootstrap';
import { createOne, deleteOne, getList, updateOne } from '../services/api';

const emptyForm = {
  name: '',
  manager: '',
  count: 0,
  status: 'Hoạt động',
  description: '',
  createdAt: '',
};

function statusBadge(status) {
  if (status === 'Hoạt động') return <Badge bg="success">Hoạt động</Badge>;
  if (status === 'Tạm dừng') return <Badge bg="warning" text="dark">Tạm dừng</Badge>;
  return <Badge bg="secondary">{status || 'Không rõ'}</Badge>;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function Department() {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  async function loadDepartments() {
    try {
      setLoading(true);
      setError('');
      const data = await getList('/departments');
      setDepartments(data);
    } catch {
      setError('Không tải được phòng ban. Hãy chạy fake server: npm run server');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return departments.filter((department) => {
      const matchKeyword =
        !keyword ||
        department.name.toLowerCase().includes(keyword) ||
        department.manager.toLowerCase().includes(keyword) ||
        department.description.toLowerCase().includes(keyword);
      const matchStatus = statusFilter === 'Tất cả' || department.status === statusFilter;
      return matchKeyword && matchStatus;
    });
  }, [departments, search, statusFilter]);

  const totalEmployees = useMemo(
    () => departments.reduce((sum, department) => sum + Number(department.count || 0), 0),
    [departments]
  );

  const openAddModal = () => {
    setEditing(null);
    setForm({ ...emptyForm, createdAt: todayString() });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (department) => {
    setEditing(department);
    setForm({
      name: department.name || '',
      manager: department.manager || '',
      count: Number(department.count || 0),
      status: department.status || 'Hoạt động',
      description: department.description || '',
      createdAt: department.createdAt || todayString(),
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Vui lòng nhập tên phòng ban';
    if (!form.manager.trim()) errors.manager = 'Vui lòng nhập trưởng phòng';
    if (Number(form.count) < 0) errors.count = 'Số nhân viên không được âm';
    if (!form.createdAt) errors.createdAt = 'Vui lòng nhập ngày tạo';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...form,
      name: form.name.trim(),
      manager: form.manager.trim(),
      description: form.description.trim(),
      count: Number(form.count || 0),
    };

    try {
      if (editing) {
        const updated = await updateOne('/departments', editing.id, { ...payload, id: editing.id });
        setDepartments((prev) => prev.map((item) => (item.id === editing.id ? updated : item)));
      } else {
        const created = await createOne('/departments', payload);
        setDepartments((prev) => [...prev, created]);
      }
      setShowModal(false);
    } catch {
      setFormErrors({ submit: 'Lưu thất bại. Kiểm tra fake server đã chạy chưa.' });
    }
  };

  const handleDelete = async (department) => {
    if (!window.confirm(`Xóa phòng ban "${department.name}" khỏi database.json?`)) return;

    try {
      await deleteOne('/departments', department.id);
      setDepartments((prev) => prev.filter((item) => item.id !== department.id));
    } catch {
      alert('Xóa thất bại. Kiểm tra fake server đã chạy chưa.');
    }
  };

  const handleExportCSV = () => {
    const header = ['ID', 'Tên phòng ban', 'Trưởng phòng', 'Số nhân viên', 'Trạng thái', 'Mô tả', 'Ngày tạo'];
    const rows = filtered.map((d) => [
      d.id,
      d.name,
      d.manager,
      d.count,
      d.status,
      d.description,
      d.createdAt,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `phong-ban-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h4 className="mb-1">Phòng ban</h4>
          <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
            Thêm, sửa, xóa và xuất CSV phòng ban. Dữ liệu được lưu trực tiếp vào database.json.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={loadDepartments}>Tải lại</Button>
          <Button variant="outline-success" size="sm" onClick={handleExportCSV}>Xuất CSV</Button>
          <Button variant="primary" size="sm" onClick={openAddModal}>+ Thêm phòng ban</Button>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1" style={{ fontSize: '13px' }}>Tổng phòng ban</p>
              <h3 className="mb-0 text-primary">{departments.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1" style={{ fontSize: '13px' }}>Tổng nhân viên theo phòng ban</p>
              <h3 className="mb-0 text-success">{totalEmployees}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1" style={{ fontSize: '13px' }}>Đang hoạt động</p>
              <h3 className="mb-0 text-info">{departments.filter((d) => d.status === 'Hoạt động').length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-6">
              <Form.Control
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Tìm theo tên phòng ban, trưởng phòng hoặc mô tả..."
              />
            </div>
            <div className="col-md-3">
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option>Tất cả</option>
                <option>Hoạt động</option>
                <option>Tạm dừng</option>
              </Form.Select>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="text-center">STT</th>
                  <th>Tên phòng ban</th>
                  <th>Trưởng phòng</th>
                  <th className="text-center">Số nhân viên</th>
                  <th className="text-center">Trạng thái</th>
                  <th>Mô tả</th>
                  <th>Ngày tạo</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">Đang tải dữ liệu...</td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map((department, index) => (
                    <tr key={department.id}>
                      <td className="text-center">{index + 1}</td>
                      <td className="fw-semibold">{department.name}</td>
                      <td>{department.manager}</td>
                      <td className="text-center">{department.count}</td>
                      <td className="text-center">{statusBadge(department.status)}</td>
                      <td style={{ minWidth: 220 }}>{department.description}</td>
                      <td>{department.createdAt}</td>
                      <td className="text-center">
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => openEditModal(department)}>
                          Sửa
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(department)}>
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">Không tìm thấy phòng ban phù hợp.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editing ? 'Sửa phòng ban' : 'Thêm phòng ban'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {formErrors.submit && <div className="alert alert-danger py-2">{formErrors.submit}</div>}

            <Form.Group className="mb-3">
              <Form.Label>Tên phòng ban</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                isInvalid={!!formErrors.name}
              />
              <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Trưởng phòng</Form.Label>
              <Form.Control
                value={form.manager}
                onChange={(e) => setForm({ ...form, manager: e.target.value })}
                isInvalid={!!formErrors.manager}
              />
              <Form.Control.Feedback type="invalid">{formErrors.manager}</Form.Control.Feedback>
            </Form.Group>

            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Số nhân viên</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={form.count}
                  onChange={(e) => setForm({ ...form, count: e.target.value })}
                  isInvalid={!!formErrors.count}
                />
                <Form.Control.Feedback type="invalid">{formErrors.count}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option>Hoạt động</option>
                  <option>Tạm dừng</option>
                </Form.Select>
              </Form.Group>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Ngày tạo</Form.Label>
              <Form.Control
                type="date"
                value={form.createdAt}
                onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
                isInvalid={!!formErrors.createdAt}
              />
              <Form.Control.Feedback type="invalid">{formErrors.createdAt}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button variant="primary" type="submit">Lưu vào database.json</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Department;
