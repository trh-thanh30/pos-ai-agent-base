'use client';
import { Loading } from '@repo/design-system/components/ui';
import useToast from '@repo/design-system/hooks/client/use-toast-notification';
import {
  accessTokenAtom,
  currentStoreAtom,
  currentUserAtom,
} from '@repo/design-system/stores/auth';
import { useAtom } from 'jotai';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '../libs/axios';
import HeaderSidebar from '../sections/dashboard/components/header-sidebar';
import Sidebar from '../sections/dashboard/components/sidebar-screen';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isExpand, setIsExpand] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [accessToken, setAccessToken] = useAtom(accessTokenAtom);
  const [, setCurrentUser] = useAtom(currentUserAtom);
  const [, setCurrentStore] = useAtom(currentStoreAtom);
  const pathName = usePathname();
  const isSalesPages = pathName?.endsWith('/sales') ?? false;
  const router = useRouter();
  const isFetched = useRef(false);
  const { showErrorToast } = useToast();

  const handleAuthError = useCallback(() => {
    showErrorToast('Phiên làm việc hết hạn, vui lòng đăng nhập lại!');
    setAccessToken(null);
    setCurrentUser(null);
    setCurrentStore(null);
    router.push(`${process.env.NEXT_PUBLIC_MAIN_URL}/auth/login`);
  }, [router, setAccessToken, setCurrentStore, setCurrentUser, showErrorToast]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || isFetched.current) return;

    const syncSession = async () => {
      try {
        const res = await api.post('/auth/refresh-token');
        const data = res?.data?.data;
        if (!data) throw new Error('No data returned');
        setAccessToken(data.access_token);
        setCurrentUser(data.user);
        setCurrentStore(data.store);
      } catch (err) {
        console.error('Session sync failed:', err);
        handleAuthError();
      } finally {
        isFetched.current = true;
        setIsSyncing(false);
      }
    };

    syncSession();
  }, [handleAuthError, hydrated, setAccessToken, setCurrentStore, setCurrentUser]);

  const shouldShowContent = hydrated && !isSyncing && !!accessToken;

  return (
    <div className="flex w-screen h-screen ">
      {!isSalesPages && <Sidebar isExpand={isExpand} setIsExpand={setIsExpand} />}
      <div className="flex  flex-col w-full h-screen bg-gray-50 overflow-auto scrollbar-fixed">
        {!isSalesPages && <HeaderSidebar />}
        <main
          className={`${isSalesPages ? 'flex-1 p-0 overflow-auto  scrollbar-fixed' : 'flex-1 p-4 overflow-auto  scrollbar-fixed'}`}
        >
          {shouldShowContent ? (
            children
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-white ">
              <div className="flex items-center gap-4">
                <Loading color="#3b82f6" size="md" />
                <span className="text-pos-blue-500 text-sm font-semibold">
                  Đang đồng bộ phiên làm việc ...
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
