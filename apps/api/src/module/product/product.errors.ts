export const PRODUCT_ERROR_MESSAGES = {
  PRODUCT_NOT_FOUND: 'Không tìm thấy sản phẩm!',
  PRODUCT_SKU_EXISTS:
    'Mã sản phẩm đã tồn tại trong cửa hàng. Vui lòng thử lập mã khác!',
  BARCODE_ALREADY_EXISTS:
    'Mã vạch (barcode) của thuộc tính đã tồn tại ở sản phẩm khác',
  FILE_NOT_FOUND: 'File not found',
  FILE_EMPTY: 'File is empty',
  FILE_TOO_LARGE: 'File size is too large, maximum allowed is 500 rows',
} as const;
