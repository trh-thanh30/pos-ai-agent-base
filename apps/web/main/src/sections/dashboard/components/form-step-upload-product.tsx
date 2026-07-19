import { Divider } from '@mantine/core';
import {
  Button,
  DropFileZone,
  Input,
  Modal,
  NumberInput,
  Select,
  Stepper,
  Table,
} from '@repo/design-system/components/ui';
import useToast from '@repo/design-system/hooks/client/use-toast-notification';
import { Check, CloudUpload, Edit, Image, Shield, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ImageUpload, { type UploadedAsset } from '../../../components/common/ImageUpload';
import { useCategories } from '../../../hooks/categories/use-categories';
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
  const { categories, getCategories } = useCategories();
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);

  useEffect(() => {
    if (opened && isActive === 1) {
      getCategories();
    }
  }, [opened, isActive, getCategories]);

  const { showSuccessToast } = useToast();

  // Local state for items
  const [localItems, setLocalItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Delete confirmation modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [deletingTempId, setDeletingTempId] = useState<number | null>(null);
  const [deletingItemName, setDeletingItemName] = useState<string>('');

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
    description: '',
    image_url: '',
    category_name: '',
  });

  const handleUpload = (file: File[]) => {
    setFiles(file);
  };

  // Filter calculations
  const filteredItems = localItems.filter((item) => {
    if (statusFilter === 'valid') return item.isStatus === true;
    if (statusFilter === 'invalid') return item.isStatus === false;
    return true;
  });

  // Pagination calculations
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Dynamic counts
  const totalLength = localItems.length;
  const errorLength = localItems.filter((item) => item.isStatus === false).length;
  const validLength = totalLength - errorLength;

  const handleDeleteRow = (tempId: number) => {
    const originalIndex = localItems.findIndex((item) => item._tempId === tempId);
    if (originalIndex === -1) return;

    const updated = [...localItems];
    updated.splice(originalIndex, 1);
    setLocalItems(updated);

    const totalPages = Math.ceil(updated.length / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  };

  const onClickDelete = (tempId: number, name: string) => {
    setDeletingTempId(tempId);
    setDeletingItemName(name);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingTempId === null) return;
    handleDeleteRow(deletingTempId);
    setDeleteConfirmOpen(false);
    setDeletingTempId(null);
    showSuccessToast('Xóa sản phẩm khỏi danh sách thành công');
  };

  const handleEditRow = (tempId: number) => {
    const originalIndex = localItems.findIndex((item) => item._tempId === tempId);
    if (originalIndex === -1) return;

    const item = localItems[originalIndex];
    setEditingIndex(originalIndex);
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
      description: item.description || '',
      image_url: item.image_url || '',
      category_name: item.category_name || '',
    });

    const initialAssets: UploadedAsset[] = [];
    if (item.image_url) {
      initialAssets.push({
        id: 'existing-image-' + originalIndex,
        url: item.image_url,
        original_name: 'product_image',
      });
    }
    setUploadedAssets(initialAssets);

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
    showSuccessToast('Cập nhật sản phẩm thành công');
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
        <div className={`flex flex-col ${isActive === 0 ? 'h-[42vh]' : 'h-[75vh]'}`}>
          <div
            className={`flex-1 pr-2 flex flex-col ${isActive === 0 ? 'overflow-y-auto' : 'overflow-hidden'}`}
          >
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
                        <p className="text-xs ">{(files[0].size / (1024 * 1024)).toFixed(2)} MB</p>
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
              <div className="space-y-4 flex flex-col flex-1 overflow-hidden mt-4">
                <div className="flex justify-between items-center shrink-0">
                  <span className="text-sm font-semibold text-gray-700">
                    Danh sách sản phẩm từ file
                  </span>
                  <div className="w-[200px]">
                    <Select
                      size="xs"
                      radius="sm"
                      placeholder="Lọc trạng thái"
                      data={[
                        { value: 'all', label: 'Tất cả sản phẩm' },
                        { value: 'valid', label: 'Sản phẩm hợp lệ' },
                        { value: 'invalid', label: 'Sản phẩm lỗi' },
                      ]}
                      value={statusFilter}
                      onChange={(val) => {
                        setStatusFilter(val || 'all');
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
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
                    totalPages={Math.max(1, Math.ceil(filteredItems.length / pageSize))}
                    pageSize={pageSize}
                    total={filteredItems.length}
                    onPageChange={(p) => setCurrentPage(p)}
                    onPageSizeChange={(s) => {
                      setPageSize(s);
                      setCurrentPage(1);
                    }}
                    renderRow={(item, index) => {
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
                                onClick={() => handleEditRow(item._tempId)}
                                className="p-1 hover:bg-blue-50 rounded text-blue-500 transition-colors"
                                title="Sửa"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => onClickDelete(item._tempId, item.product_name)}
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
                <div className="flex items-center gap-4 justify-end shrink-0">
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
                      const itemsWithId = (valRes.result || []).map((item: any, idx: number) => ({
                        ...item,
                        _tempId: idx,
                      }));
                      setLocalItems(itemsWithId);
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
        size="85%"
      >
        <div className="bg-gray-50/70 p-5 -mx-5 -mb-5 rounded-b-md">
          <div className="w-full h-full mx-auto grid lg:grid-cols-[1fr_0.5fr] grid-cols-1 gap-3">
            {/* left */}
            <div className="space-y-4 mb-6">
              {/* Product info */}
              <div className="bg-white p-5 rounded-md">
                <h2 className="text-base font-stretch-200% font-semibold text-gray-900">
                  Thông tin sản phẩm
                </h2>
                <div className="space-y-5 mt-4">
                  <div className="flex gap-2">
                    <Input
                      size="sm"
                      withAsterisk
                      radius="sm"
                      className="flex-1"
                      label="Tên sản phẩm"
                      placeholder="Nhập tên sản phẩm"
                      value={editForm.product_name}
                      onChange={(e) => setEditForm({ ...editForm, product_name: e.target.value })}
                    />
                    <Input
                      size="sm"
                      radius="sm"
                      className="flex-1"
                      label="Mã SKU"
                      placeholder="Nhập mã SKU (tự động tạo khi để trống)"
                      value={editForm.product_sku}
                      onChange={(e) => setEditForm({ ...editForm, product_sku: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="space-y-0.5 flex-1">
                      <Input
                        size="sm"
                        radius="sm"
                        withAsterisk
                        label="Đơn vị tính "
                        placeholder="Nhập đơn vị tính"
                        value={editForm.base_unit}
                        onChange={(e) => setEditForm({ ...editForm, base_unit: e.target.value })}
                      />
                      <span className="text-xs text-gray-500">
                        Đơn vị nhỏ nhất dùng để theo dõi tồn kho.
                      </span>
                    </div>
                    {/* Variant Name for import */}
                    <Input
                      size="sm"
                      radius="sm"
                      className="flex-1"
                      label="Tên biến thể"
                      placeholder="Nhập tên biến thể"
                      value={editForm.variant_name}
                      onChange={(e) => setEditForm({ ...editForm, variant_name: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      size="sm"
                      radius="sm"
                      className="flex-1"
                      label="Mã SKU biến thể"
                      placeholder="Nhập mã SKU biến thể"
                      value={editForm.variant_sku}
                      onChange={(e) => setEditForm({ ...editForm, variant_sku: e.target.value })}
                    />
                    <Input
                      size="sm"
                      radius="sm"
                      className="flex-1"
                      label="Mã vạch (Barcode)"
                      placeholder="Nhập mã vạch"
                      value={editForm.barcode}
                      onChange={(e) => setEditForm({ ...editForm, barcode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500 font-medium">Mô tả</span>
                    <ReactQuill
                      value={editForm.description ?? ''}
                      onChange={(value: string) => setEditForm({ ...editForm, description: value })}
                      theme="snow"
                      placeholder="Nhập mô tả sản phẩm"
                    />
                  </div>
                </div>
              </div>

              {/* Product price */}
              <div className="bg-white p-5 rounded-md">
                <h2 className="text-base font-stretch-200% font-semibold text-gray-900">
                  Thông tin giá
                </h2>
                <div className="space-y-5 mt-4">
                  <div className="flex gap-2">
                    <NumberInput
                      size="sm"
                      radius="sm"
                      className="flex-1"
                      label="Giá bán"
                      placeholder="Nhập giá bán sản phẩm"
                      value={editForm.price}
                      onChange={(val) => setEditForm({ ...editForm, price: val })}
                    />
                    <NumberInput
                      size="sm"
                      radius="sm"
                      className="flex-1"
                      label="Giá nhập"
                      placeholder="Nhập giá nhập sản phẩm"
                      value={editForm.cost}
                      onChange={(val) => setEditForm({ ...editForm, cost: val })}
                    />
                  </div>
                </div>
              </div>

              {/* Product inventory quantity */}
              <div className="bg-white p-5 rounded-md">
                <h2 className="text-base font-stretch-200% font-semibold text-gray-900">
                  Thông tin kho
                </h2>

                <div className="border border-gray-200 rounded-md overflow-hidden mt-4">
                  <table className="w-full">
                    {/* Table Header */}
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Kho lưu trữ
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 text-nowrap">
                          Tồn kho
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-800">Cửa hàng chính</td>
                        <td className="px-6 py-4 text-sm text-nowrap text-gray-500 space-y-1.5">
                          <NumberInput
                            size="sm"
                            radius="sm"
                            placeholder="Nhập số lượng tồn"
                            value={editForm.quantity}
                            onChange={(val) => setEditForm({ ...editForm, quantity: val })}
                          />
                          <p className="text-xs text-gray-500">
                            Với số lượng khác 0 thì bản ghi cho biến động kho sẽ được tao.
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* right */}
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-md">
                <ImageUpload
                  label="Ảnh sản phẩm"
                  folder="products"
                  maxFiles={8}
                  value={uploadedAssets}
                  onChange={(assets) => {
                    setUploadedAssets(assets);
                    setEditForm((prev: any) => ({
                      ...prev,
                      image_url: assets[0]?.url || '',
                    }));
                  }}
                />
              </div>
              <div className="flex flex-col gap-4">
                <div className="bg-white p-5 rounded-md space-y-4">
                  <h2 className="text-base font-stretch-200% font-semibold text-gray-900">
                    Thông tin thêm
                  </h2>
                  <Select
                    position="bottom"
                    size="sm"
                    radius="sm"
                    label="Nhóm danh mục"
                    placeholder="Chọn nhóm danh mục"
                    data={
                      categories?.map((item) => ({
                        value: item.name,
                        label: item.name,
                      })) || []
                    }
                    value={editForm.category_name}
                    onChange={(val) =>
                      setEditForm((prev: any) => ({ ...prev, category_name: val || '' }))
                    }
                    searchable
                  />
                  <Input
                    size="sm"
                    radius="sm"
                    label="Danh mục từ file / Danh mục mới"
                    placeholder="Nhập tên danh mục mới nếu không có sẵn"
                    value={editForm.category_name}
                    onChange={(e) =>
                      setEditForm((prev: any) => ({ ...prev, category_name: e.target.value }))
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveEdit}
                    title="Lưu thay đổi"
                    size="sm"
                    radius="sm"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => setIsEditModalOpen(false)}
                    title="Hủy"
                    variant="outline"
                    size="sm"
                    radius="sm"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeletingTempId(null);
        }}
        size="md"
        title={<span className="text-lg font-bold text-gray-950">Xác nhận hành động</span>}
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa sản phẩm{' '}
            <span className="text-pos-blue-500 font-semibold">{deletingItemName}</span> vĩnh viễn?
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              title="Hủy bỏ"
              variant="outline"
              size="sm"
              radius="sm"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeletingTempId(null);
              }}
              color="#374151"
            />
            <Button
              title="Xác nhận"
              size="sm"
              radius="sm"
              onClick={handleConfirmDelete}
              color="#fb2c36"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
