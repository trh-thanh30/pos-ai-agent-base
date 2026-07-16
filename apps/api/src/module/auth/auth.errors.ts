export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Email/tên người dùng hoặc mật khẩu không hợp lệ',
  INVALID_REFRESH_TOKEN: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại',
  INVALID_ACCESS_TOKEN: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại',
  INVALID_VALIDATION_CODE: 'Mã xác minh không hợp lệ',
  CODE_EXPIRED: 'Mã xác minh đã hết hạn',
  ACCOUNT_INACTIVE:
    'Tài khoản không hoạt động. Vui lòng liên hệ bộ phận hỗ trợ',
  EMAIL_NOT_VERIFIED: 'Vui lòng xác minh email của bạn trước khi đăng nhập',
  EMAIL_ALREADY_VERIFIED: 'Email đã được xác minh',
  USER_NOT_FOUND: 'Tài khoản không tồn tại',
  EMAIL_ALREADY_EXISTS: 'Một tài khoản với email này đã tồn tại',
  USERNAME_ALREADY_EXISTS: 'Tên người dùng đã được sử dụng',
  STORE_NOT_FOUND: 'Cửa hàng không tồn tại',
  NOT_STORE_MEMBER: 'Bạn không phải là thành viên của cửa hàng này',
} as const;
