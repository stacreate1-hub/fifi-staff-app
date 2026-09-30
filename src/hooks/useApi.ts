import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type BookingStatus, type EnquiryStage } from '@/lib/api';
import { useSession } from '@/lib/auth';

/** Throws if called before a token exists — every hook here requires SessionProvider to have a token. */
function requireToken(token: string | null): string {
  if (!token) throw new Error('No active session token');
  return token;
}

export function useBookings() {
  const { token } = useSession();
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.getBookings(requireToken(token)),
    enabled: !!token,
  });
}

export function useBooking(bookingId: string | undefined) {
  const { token } = useSession();
  return useQuery({
    queryKey: ['bookings', bookingId],
    queryFn: () => api.getBooking(requireToken(token), bookingId as string),
    enabled: !!token && !!bookingId,
  });
}

export function usePayments(bookingId: string | undefined) {
  const { token } = useSession();
  return useQuery({
    queryKey: ['payments', bookingId],
    queryFn: () => api.getPayments(requireToken(token), bookingId as string),
    enabled: !!token && !!bookingId,
  });
}

export function useBalance(bookingId: string | undefined) {
  const { token } = useSession();
  return useQuery({
    queryKey: ['balance', bookingId],
    queryFn: () => api.getBalance(requireToken(token), bookingId as string),
    enabled: !!token && !!bookingId,
  });
}

export function useCreateBooking() {
  const { token } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof api.createBooking>[1]) => api.createBooking(requireToken(token), input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useRecordPayment(bookingId: string) {
  const { token } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, method }: { amount: number; method?: string }) =>
      api.recordPayment(requireToken(token), bookingId, amount, method),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['bookings', bookingId] });
      qc.invalidateQueries({ queryKey: ['payments', bookingId] });
      qc.invalidateQueries({ queryKey: ['balance', bookingId] });
    },
  });
}

export function useRecordRefund(bookingId: string) {
  const { token } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { amount: number; method?: string; reference?: string; note?: string; new_status?: BookingStatus }) =>
      api.recordRefund(requireToken(token), bookingId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['bookings', bookingId] });
      qc.invalidateQueries({ queryKey: ['payments', bookingId] });
      qc.invalidateQueries({ queryKey: ['balance', bookingId] });
    },
  });
}

export function useUpdateStatus(bookingId: string) {
  const { token } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: BookingStatus) => api.updateStatus(requireToken(token), bookingId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['bookings', bookingId] });
    },
  });
}

export function useEnquiries(stage?: EnquiryStage) {
  const { token } = useSession();
  return useQuery({
    queryKey: ['enquiries', stage ?? 'all'],
    queryFn: () => api.getEnquiries(requireToken(token), stage),
    enabled: !!token,
  });
}

export function useUpdateEnquiry() {
  const { token } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: number; stage?: EnquiryStage; next_followup?: string; notes?: string }) =>
      api.updateEnquiry(requireToken(token), id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['enquiries'] }),
  });
}

export function useReports(period: 'calendar' | 'tax_year' = 'calendar', year?: number) {
  const { token, capabilities } = useSession();
  return useQuery({
    queryKey: ['reports', period, year ?? 'current'],
    queryFn: () => api.getReports(requireToken(token), period, year),
    // /reports is gated server-side to fifi_view_reports (Administrator and
    // Fifi Finance; not Fifi Office Admin or Fifi Staff). No point firing a
    // query we already know will 403.
    enabled: !!token && !!capabilities?.view_reports,
  });
}
