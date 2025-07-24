import { create } from 'zustand';
import { voucherApi, ApiVoucher } from '../services/api';

interface VoucherState {
  vouchers: ApiVoucher[];
  isLoading: boolean;
  error: string | null;
  fetchVouchers: () => Promise<void>;
}

export const useVoucherStore = create<VoucherState>((set) => ({
  vouchers: [],
  isLoading: false,
  error: null,

  fetchVouchers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await voucherApi.getVouchers();
      set({ vouchers: res.data.vouchers || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Không thể lấy voucher', isLoading: false, vouchers: [] });
    }
  },
})); 