'use client';
import { Checkbox, Drawer, NumberInput, Radio } from '@mantine/core';
import { Select } from '@repo/design-system/components/ui';
import useToast from '@repo/design-system/hooks/client/use-toast-notification';
import { Category } from '@repo/design-system/types';
import React, { useState } from 'react';
import { ProductFilters } from '../../../../../main/src/hooks/product/use-product';
import { VariantFilter } from '../../../hooks/variant/use-variant';

export default function FiltersProducts({
  isOpenFilterProducts,
  sort,
  sortBy,
  setSort,
  setSortBy,
  setIsOpenFilterProducts,
  setFilters,
  categories = [],
}: {
  isOpenFilterProducts: boolean;
  sort: string;
  sortBy: string;
  setSort: (value: 'asc' | 'desc') => void;
  setSortBy: (value: string) => void;
  setIsOpenFilterProducts: (value: boolean) => void;
  setFilters: React.Dispatch<React.SetStateAction<ProductFilters | VariantFilter>>;
  categories?: Category[];
}) {
  const { showSuccessToast } = useToast();

  // Local draft state
  const [stockStatus, setStockStatus] = useState<string>('all'); // 'all' | 'in' | 'out'
  const [minPrice, setMinPrice] = useState<number | string>('');
  const [maxPrice, setMaxPrice] = useState<number | string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const handleFilterApply = () => {
    setFilters((prev: any) => ({
      ...prev,
      ...(stockStatus === 'in' ? { inStock: 'true' } : {}),
      ...(stockStatus === 'out' ? { inStock: 'false' } : {}),
      ...(stockStatus === 'all' ? { inStock: undefined } : {}),
      ...(minPrice !== '' ? { minPrice: String(minPrice) } : { minPrice: undefined }),
      ...(maxPrice !== '' ? { maxPrice: String(maxPrice) } : { maxPrice: undefined }),
      ...(selectedCategoryId ? { categoryId: selectedCategoryId } : { categoryId: undefined }),
    }));
  };

  const handleReset = () => {
    setSort('desc');
    setSortBy('createdAt');
    setStockStatus('all');
    setMinPrice('');
    setMaxPrice('');
    setSelectedCategoryId(null);
    setFilters((prev: any) => ({
      ...prev,
      inStock: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      categoryId: undefined,
    }));
  };

  return (
    <Drawer
      size="md"
      position="right"
      opened={isOpenFilterProducts}
      onClose={() => setIsOpenFilterProducts(false)}
      title={<div className="text-2xl font-semibold text-pos-blue-500">Bộ Lọc</div>}
      styles={{
        body: {
          height: '90%',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 0,
          overflow: 'hidden',
        },
      }}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Scrollable content — px-1 prevents focus-ring clipping */}
        <div className="flex-1 overflow-y-auto space-y-6 px-1 pb-2">

          {/* SORT */}
          <div>
            <h2 className="text-base font-semibold text-gray-700 mb-2">Sắp xếp</h2>
            <Select
              value={`${sortBy}-${sort}`}
              onChange={(value) => {
                const [sortByValue, sortValue] = value!.split('-');
                setSortBy(sortByValue);
                setSort(sortValue as 'asc' | 'desc');
              }}
              allowDeselect={false}
              position="bottom"
              size="sm"
              radius="sm"
              data={[
                { label: 'Thời gian tạo giảm dần', value: 'createdAt-desc' },
                { label: 'Thời gian tạo tăng dần', value: 'createdAt-asc' },
                { label: 'Tên: A - Z', value: 'name-asc' },
                { label: 'Tên: Z - A', value: 'name-desc' },
                { label: 'Giá bán tăng dần', value: 'price-asc' },
                { label: 'Giá bán giảm dần', value: 'price-desc' },
              ]}
            />
          </div>

          {/* STOCK STATUS — Radio group */}
          <div>
            <h2 className="text-base font-semibold text-gray-700 mb-3">Trạng thái tồn kho</h2>
            <Radio.Group
              value={stockStatus}
              onChange={setStockStatus}
            >
              <div className="flex flex-col gap-2.5">
                <Radio
                  value="all"
                  label="Tất cả"
                  color="blue"
                  styles={{ label: { fontWeight: 500, cursor: 'pointer' } }}
                />
                <div className="flex items-center justify-between">
                  <Radio
                    value="in"
                    label="Còn hàng"
                    color="blue"
                    styles={{ label: { fontWeight: 500, cursor: 'pointer' } }}
                  />
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                    Tồn kho &gt; 0
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Radio
                    value="out"
                    label="Hết hàng"
                    color="blue"
                    styles={{ label: { fontWeight: 500, cursor: 'pointer' } }}
                  />
                  <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">
                    Tồn kho = 0
                  </span>
                </div>
              </div>
            </Radio.Group>
          </div>

          {/* PRICE RANGE — Mantine NumberInput avoids clipping */}
          <div>
            <h2 className="text-base font-semibold text-gray-700 mb-3">Khoảng giá bán</h2>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <NumberInput
                  label="Từ (₫)"
                  id="filter-min-price"
                  min={0}
                  value={minPrice}
                  onChange={setMinPrice}
                  placeholder="0"
                  size="sm"
                  radius="sm"
                  hideControls
                  styles={{ label: { fontSize: 12, color: '#6b7280', fontWeight: 500 } }}
                />
              </div>
              <div className="mt-5 text-gray-400 font-medium select-none">—</div>
              <div className="flex-1">
                <NumberInput
                  label="Đến (₫)"
                  id="filter-max-price"
                  min={0}
                  value={maxPrice}
                  onChange={setMaxPrice}
                  placeholder="∞"
                  size="sm"
                  radius="sm"
                  hideControls
                  styles={{ label: { fontSize: 12, color: '#6b7280', fontWeight: 500 } }}
                />
              </div>
            </div>
            {(minPrice !== '' || maxPrice !== '') && (
              <button
                onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                className="mt-2 text-xs text-gray-400 hover:text-red-400 transition-colors"
              >
                Xóa khoảng giá
              </button>
            )}
          </div>

          {/* CATEGORY — Checkbox list */}
          {categories.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-700 mb-3">Danh mục sản phẩm</h2>
              <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between">
                    <Checkbox
                      value={cat.id}
                      label={cat.name}
                      color="blue"
                      checked={selectedCategoryId === cat.id}
                      onChange={() =>
                        setSelectedCategoryId((prev) => (prev === cat.id ? null : cat.id))
                      }
                      styles={{
                        label: { fontWeight: 500, cursor: 'pointer', fontSize: 14 },
                      }}
                    />
                  </div>
                ))}
              </div>
              {selectedCategoryId && (
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className="mt-2 text-xs text-gray-400 hover:text-red-400 transition-colors"
                >
                  Xóa bộ lọc danh mục
                </button>
              )}
            </div>
          )}
        </div>

        {/* Fixed footer */}
        <div className="flex items-center justify-between text-sm font-semibold shrink-0 pt-4 border-t border-gray-100">
          <button
            onClick={handleReset}
            className="text-red-500 border border-red-500 py-2 px-4 rounded-md hover:cursor-pointer hover:bg-red-50 transition-colors"
          >
            Đặt lại
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpenFilterProducts(false)}
              className="text-pos-blue-500 bg-pos-blue-50 py-2 px-4 rounded-md hover:cursor-pointer hover:bg-pos-blue-100 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={() => {
                handleFilterApply();
                setIsOpenFilterProducts(false);
                showSuccessToast('Bộ lọc đã được áp dụng!');
              }}
              className="bg-pos-blue-500 text-white py-2 px-4 rounded-md hover:cursor-pointer hover:bg-pos-blue-600 transition-colors"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
