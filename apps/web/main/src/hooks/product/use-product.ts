'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import useToast from '@repo/design-system/hooks/client/use-toast-notification';
import { currentStoreAtom } from '@repo/design-system/stores/auth';
import { Product, ValidationProductRes } from '@repo/design-system/types';
import { ApiResponse } from '@repo/types/response';
import { useAtomValue } from 'jotai';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../libs/axios';
import {
  CreateProductInput,
  CreateProductSchema,
  UpdateProductInput,
  UpdateProductSchema,
} from '../../schemas/product/product.schema';
import { exportExcel } from '../../utils/export-excel/export';
import { FilterValue, useQueryParams } from '../query/use-query-params';
import { useRequestHelper } from '../use-request-helper';
export interface ProductFilters extends Record<string, FilterValue> {
  q?: string;
  product_status?: string;
  categories?: string;
}

export function useProduct() {
  const { loading, requestWrapper } = useRequestHelper();
  const { showSuccessToast } = useToast();
  const {
    paginationParams,
    sort,
    sortBy,
    filters,
    pagination,

    setPaginationParams,
    setFilters,
    setPagination,
    buildParams,
    setSortBy,
    setSort,
  } = useQueryParams<ProductFilters>({
    q: 'q',
    product_status: 'product_status',
    categories: 'categories',
  });
  // STATE
  const currentStore = useAtomValue(currentStoreAtom);
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product>();
  const [validationProducts, setValidationProducts] = useState<ValidationProductRes>({
    itemLength: 0,
    itemErrorLength: 0,
    itemValidLength: 0,
    result: [],
  });
  // FORM
  const createProductForm = useForm<CreateProductInput>({
    resolver: zodResolver(CreateProductSchema),
  });
  const updateProductForm = useForm<UpdateProductInput>({
    resolver: zodResolver(UpdateProductSchema),
  });

  // ACTION FUNCTION
  const getProducts = useCallback(async () => {
    const res = await requestWrapper(() =>
      api.get(`/products/filter-product?${buildParams().toString()}`)
    );
    if (res?.data.success) {
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    }
  }, [buildParams, requestWrapper, setPagination]);
  const createProduct = useCallback(
    async (data: CreateProductInput) => {
      if (!currentStore?.id) return;
      const res = await requestWrapper(() => api.post<ApiResponse>(`/products`, data));
      if (res?.data.success) {
        getProducts();
        showSuccessToast(res.data.message as string);
        return {
          success: true,
          data: res.data.data,
        };
      }
      return {
        success: false,
      };
    },
    [currentStore?.id, requestWrapper, getProducts, showSuccessToast]
  );
  const deleteProduct = async (productId: string) => {
    if (!currentStore?.id) return;
    const res = await requestWrapper(() => api.delete(`/products/${productId}`));
    if (res?.data.success) {
      showSuccessToast(res.data.message);
      getProducts();
    }
  };
  const updateProduct = async (productId: string, updateProductForm: UpdateProductInput) => {
    if (!currentStore?.id) return;
    const res = await requestWrapper(() => api.patch(`/products/${productId}`, updateProductForm));
    if (res?.data.success) {
      showSuccessToast(res.data.message);
      getProducts();
      return true;
    }
    return false;
  };
  const getProductById = useCallback(
    async (productId: string) => {
      if (!currentStore?.id) return;
      const res = await api.get(`/products/${productId}`);

      if (res?.data.success) {
        setProduct(res.data.data);
      }
    },
    [currentStore?.id]
  );

  // EXCEL
  const downloadProductTemplate = useCallback(async () => {
    await requestWrapper(async () => {
      const res = await api.get('/products/excel/template', {
        responseType: 'blob',
      });

      exportExcel(
        res,
        `mau_phieu_san_pham_${new Date().toLocaleDateString()}.xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    });
  }, [requestWrapper]);

  const exportProductExcel = useCallback(async () => {
    await requestWrapper(async () => {
      const res = await api.get('/products/excel/export', {
        responseType: 'blob',
      });

      exportExcel(
        res,
        `danh_sach_san_pham_${new Date().toLocaleDateString()}.xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    });
  }, [requestWrapper]);

  const validationImportProduct = useCallback(
    async (file: File, onProgress?: (percent: number) => void, signal?: AbortSignal) => {
      const formData = new FormData();
      formData.append('product_validation', file);
      const res = await requestWrapper(() =>
        api.post<ApiResponse>(`/products/excel/import/validation`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal,
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(Math.min(percent, 99));
            }
          },
        })
      );
      if (res?.data.success) {
        if (onProgress) onProgress(100);
        showSuccessToast(res.data.message as string);
        setValidationProducts(res.data.data as ValidationProductRes);
        return res.data.data as ValidationProductRes;
      }
      return null;
    },
    [requestWrapper, showSuccessToast]
  );
  const importProduct = useCallback(
    async (
      customItems?: any[],
      onProgress?: (percent: number, currentItem: number, totalItems: number) => void,
      signal?: AbortSignal
    ) => {
      const targetItems = customItems || validationProducts.result;
      const CHUNK_SIZE = 50;
      const totalItems = targetItems.length;

      if (totalItems === 0) return true;

      const chunks: any[][] = [];
      for (let i = 0; i < totalItems; i += CHUNK_SIZE) {
        chunks.push(targetItems.slice(i, i + CHUNK_SIZE));
      }

      for (let index = 0; index < chunks.length; index++) {
        if (signal?.aborted) {
          return false;
        }

        const chunk = chunks[index];
        const currentProcessed = Math.min((index + 1) * CHUNK_SIZE, totalItems);

        try {
          const res = await requestWrapper(() =>
            api.post<ApiResponse>(`/products/excel/import/save`, {
              items: chunk.map((item) => ({
                ...item,
                price: item.price ? Number(item.price) : 0,
                cost: item.cost ? Number(item.cost) : 0,
                quantity: item.quantity ? Number(item.quantity) : 0,
              })),
            }, {
              signal
            })
          );

          if (res?.data.success) {
            if (onProgress) {
              const percent = Math.round(((index + 1) / chunks.length) * 100);
              onProgress(percent, currentProcessed, totalItems);
            }
          } else {
            return false;
          }
        } catch (error: any) {
          if (error?.name === 'CanceledError' || signal?.aborted) {
            return false;
          }
          throw error;
        }
      }

      showSuccessToast(`Đã nhập thành công ${totalItems} sản phẩm.`);
      return true;
    },
    [validationProducts.result, requestWrapper, showSuccessToast]
  );

  return {
    getProducts,
    getProductById,
    createProduct,
    deleteProduct,
    updateProduct,
    setFilters,
    setPaginationParams,
    setSortBy,
    setSort,
    setProducts,
    downloadProductTemplate,
    exportProductExcel,
    validationImportProduct,
    importProduct,
    validationProducts,
    setValidationProducts,
    pagination,
    paginationParams,
    filters,
    products,
    loading,
    createProductForm,
    updateProductForm,
    product,
    sort,
    sortBy,
  };
}
