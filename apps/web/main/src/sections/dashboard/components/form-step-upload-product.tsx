import { Divider } from '@mantine/core';
import {
  Button,
  DropFileZone,
  Modal,
  Stepper,
  Table,
  Input,
  NumberInput,
} from '@repo/design-system/components/ui';
import { Check, CloudUpload, Edit, Image, Shield, Trash2, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useProduct } from '../../../hooks/product/use-product';
import { formatCurrency } from '../../../utils';

const steps = [
  {
    label: 'Chọn file dữ liệu ',
    icon: <Upload size={16} />,
  },
  {
    label: 'Xác thực dữ liệu',
    icon: <Shield size={16} />,
  },
  {
    label: 'Hoàn thành',
    icon: <Check size={16} />,
  },
];

export default function FormStepUploadProduct({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const [isActive, setIsActive] = useState<number>(0);
  const [files, setFiles] = useState<File[] | null>(null);

  const { validationImportProduct, importProduct, getProducts, loading } = useProduct();

  // Local state for items
  const [localItems, setLocalItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form fields for editing
  const [editForm, setEditForm] = useState<any>({
    product_name: '',
    product_sku: '',
    base_unit: '',
    variant_name: '',
    variant_sku: '',
    barcode: '',
    price: 0,
    cost: 0,
    quantity: 0,
  });

  const handleUpload = (file: File[]) => {
    setFiles(file);
  };

  // Pagination calculations
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = localItems.slice(startIndex, endIndex);

  // Dynamic counts
  const totalLength = localItems.length;
  const errorLength = localItems.filter((item) => item.isStatus === false).length;
  const validLength = totalLength - errorLength;

  const handleDeleteRow = (index: number) => {
    const updated = [...localItems];
    updated.splice(index, 1);
    setLocalItems(updated);

    const totalPages = Math.ceil(updated.length / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  };

  const handleEditRow = (index: number) => {
    const item = localItems[index];
    setEditingIndex(index);
    setEditForm({
      product_name: item.product_name || '',
      product_sku: item.product_sku || '',
      base_unit: item.base_unit || '',
      variant_name: item.variant_name || '',
      variant_sku: item.variant_sku || '',
      barcode: item.barcode || '',
      price: item.price || 0,
      cost: item.cost || 0,
      quantity: item.quantity || 0,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    const updated = [...localItems];

    updated[editingIndex] = {
      ...updated[editingIndex],
      ...editForm,
      isStatus: true,
      msg: '',
    };

    setLocalItems(updated);
    setIsEditModalOpen(false);
    setEditingIndex(null);
  };

  return (
    <>
      <Modal
        title={<p className="text-lg font-semibold"> Nhập file danh sách sản phẩm</p>}
        size={isActive === 0 ? 'xl' : '85%'}
        opened={opened}
        closeOnClickOutside={false}
        onClose={onClose}
      >
        <div className={`flex flex-col ${isActive === 0 ? 'h-[42h]' : 'h-[75vh]'}`}>
          <div className="flex-1 overflow-y-auto pr-2">
            <Stepper active={isActive} setActive={setIsActive} steps={steps} size="sm" />
            <Divider my={'lg'} />
            {isActive === 0 && (
              <>
                <DropFileZone
                  disabled={files ? true : false}
                  title="Kéo thả file vào đây hoặc tải lên từ thiết bị"
                  description="Tối đa 20MB, theo định dạng .xlsx"
                  idleIcon={<CloudUpload size={28} color="#3b82f6" />}
                  accept={{
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                    'application/vnd.ms-excel': ['.xls'],
                  }}
                  maxSizeMb={20}
                  onDrop={handleUpload}
                />
                {files && (
                  <div className="p-2 rounded-md bg-gray-100 flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                      <Image size={30} />
                      <div className="space-y-1">
                        <p className="text-sm ">{files[0].name}</p>
                        <p className="text-xs ">
                          {(files[0].size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFiles(null)}
                      type="button"
                      className="text-gray-500 hover:cursor-pointer hover:text-gray-800"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
            {isActive === 1 && (
              <div className="space-y-6 flex flex-col h-full">
                <div className="flex-1 overflow-hidden min-h-[380px]">
                  <Table
                    hasMarginTop={false}
                    hasPadding={false}
                    hasPagination={true}
                    data={paginatedItems}
                    tableHeaders={[
                      'Sản phẩm gốc',
                      'Mã SP (SKU)',
                      'Đơn vị gốc',
                      'Tên biến thể',
                      'Mã biến thể (SKU)',
                      'Mã vạch (barcode)',
                      'Giá bán',
                      'Giá nhập',
                      'Số lượng tồn',
                      'Thông báo',
                      'Hành động',
                    ]}
                    page={currentPage}
                    totalPages={Math.max(1, Math.ceil(localItems.length / pageSize))}
                    pageSize={pageSize}
                    total={localItems.length}
                    onPageChange={(p) => setCurrentPage(p)}
                    onPageSizeChange={(s) => {
                      setPageSize(s);
                      setCurrentPage(1);
                    }}
                    renderRow={(item, index) => {
                      const actualIndex = startIndex + index;
                      return (
                        <>
                          <td className="py-3 px-2 text-xs ">{item.product_name}</td>
                          <td className="py-3 px-2 text-xs">{item.product_sku}</td>
                          <td className="py-3 px-2 text-xs font-semibold text-pos-blue-500">
                            {item.base_unit}
                          </td>
                          <td className="py-3 px-2 text-xs">{item.variant_name}</td>
                          <td className="py-3 px-2 text-xs">{item.variant_sku}</td>
                          <td className="py-3 px-2 text-xs">{item.barcode}</td>
                          <td className="py-3 px-2 text-xs">{formatCurrency(item.price)}</td>
                          <td className="py-3 px-2 text-xs">{formatCurrency(item.cost)}</td>
                          <td className="py-3 px-2 text-xs">{item.quantity}</td>
                          <td
                            className={`py-3 px-2 text-xs ${
                              item.isStatus === false ? 'text-red-500' : 'text-green-500'
                            }`}
                          >
                            {item.isStatus === false ? item.msg : 'Sản phẩm hợp lệ'}
                          </td>
                          <td className="py-3 px-2 text-xs">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditRow(actualIndex)}
                                className="p-1 hover:bg-blue-50 rounded text-blue-500 transition-colors"
                                title="Sửa"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(actualIndex)}
                                className="p-1 hover:bg-red-50 rounded text-red-500 transition-colors"
                                title="Xóa"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      );
                    }}
                  />
                </div>
                <div className="flex items-center gap-4 justify-end ">
                  <p className="text-sm text-gray-800">Tổng số sản phẩm: {totalLength}</p>
                  <p className="text-sm text-red-500">Số sản phẩm lỗi: {errorLength}</p>
                  <p className="text-sm text-green-500">Số sản phẩm hợp lệ: {validLength}</p>
                </div>
              </div>
            )}
          </div>
          <div className="shrink-0 bg-white">
            <Divider my={'lg'} />

            <div className="flex items-center gap-2 justify-end ">
              <Button
                size="sm"
                radius="sm"
                variant="outline"
                onClick={() => {
                  if (isActive === 0) {
                    onClose();
                    setFiles(null);
                    setIsActive(0);
                  } else if (isActive === 1) {
                    setIsActive(0);
                  }
                }}
                title={isActive === 0 ? 'Hủy' : 'Quay lại'}
              />
              <Button
                disabled={isActive === 0 && !files}
                loading={loading}
                onClick={async () => {
                  if (isActive === 0) {
                    if (!files) return;
                    const valRes = await validationImportProduct(files[0]);

                    if (valRes) {
                      setLocalItems(valRes.result || []);
                      setIsActive(1);
                      setFiles(null);
                      setCurrentPage(1);
                    }
                  } else if (isActive === 1) {
                    const success = await importProduct(localItems);
                    if (success) {
                      onClose();
                      setIsActive(0);
                      await getProducts();
                    }
                  }
                }}
                size="sm"
                radius="sm"
                title={isActive === 0 ? 'Tiếp tục' : ' Xác thực và tạo sản phẩm'}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        title={<p className="text-lg font-semibold">Chỉnh sửa sản phẩm import</p>}
        opened={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        size="lg"
      >
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tên sản phẩm gốc"
              value={editForm.product_name}
              onChange={(e) => setEditForm({ ...editForm, product_name: e.target.value })}
              radius="sm"
              size="sm"
              withAsterisk
            />
            <Input
              label="Mã SP (SKU)"
              value={editForm.product_sku}
              onChange={(e) => setEditForm({ ...editForm, product_sku: e.target.value })}
              radius="sm"
              size="sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Đơn vị gốc"
              value={editForm.base_unit}
              onChange={(e) => setEditForm({ ...editForm, base_unit: e.target.value })}
              radius="sm"
              size="sm"
              withAsterisk
            />
            <Input
              label="Mã vạch (barcode)"
              value={editForm.barcode}
              onChange={(e) => setEditForm({ ...editForm, barcode: e.target.value })}
              radius="sm"
              size="sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tên biến thể"
              value={editForm.variant_name}
              onChange={(e) => setEditForm({ ...editForm, variant_name: e.target.value })}
              radius="sm"
              size="sm"
            />
            <Input
              label="Mã biến thể (SKU)"
              value={editForm.variant_sku}
              onChange={(e) => setEditForm({ ...editForm, variant_sku: e.target.value })}
              radius="sm"
              size="sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <NumberInput
              label="Giá bán"
              value={editForm.price}
              onChange={(val) => setEditForm({ ...editForm, price: val })}
              radius="sm"
              size="sm"
            />
            <NumberInput
              label="Giá nhập"
              value={editForm.cost}
              onChange={(val) => setEditForm({ ...editForm, cost: val })}
              radius="sm"
              size="sm"
            />
            <NumberInput
              label="Số lượng tồn"
              value={editForm.quantity}
              onChange={(val) => setEditForm({ ...editForm, quantity: val })}
              radius="sm"
              size="sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              title="Hủy"
              variant="outline"
              size="sm"
              radius="sm"
              onClick={() => setIsEditModalOpen(false)}
            />
            <Button
              title="Lưu thay đổi"
              size="sm"
              radius="sm"
              onClick={handleSaveEdit}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
