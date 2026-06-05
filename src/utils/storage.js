// Lấy dữ liệu từ localStorage, nếu không có thì trả về defaultValue
export function getLocalData(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (e) {
    return defaultValue;
  }
}

// Lưu dữ liệu vào localStorage
export function setLocalData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Không thể lưu vào localStorage:', e);
  }
}

// Xóa dữ liệu khỏi localStorage theo key
export function removeLocalData(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Không thể xóa khỏi localStorage:', e);
  }
}
