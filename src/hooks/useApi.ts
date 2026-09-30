import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type BookingStatus, type EnquiryStage, type MessageType, type StaffRole } from '@/lib/api';
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

export function usePhotographers() {
  const { token, capabilities } = useSession();
  return useQuery({
    queryKey: ['photographers'],
    queryFn: () => api.getPhotographers(requireToken(token)),
    // Same scoping as the assign endpoint itself — manage_options OR
    // (view_all_bookings AND manage_clients), which correctly excludes
    // Fifi Finance despite them holding view_all_bookings.
    enabled: !!token && !!capabilities?.manage_clients,
  });
}

export function useAssignPhotographer(bookingId: string) {
  const { token } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photographerId: number | null) => api.assignPhotographer(requireToken(token), bookingId, photographerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['bookings', bookingId] });
    },
  });
}

export function useStaffAccounts() {
  const { token, capabilities } = useSession();
  return useQuery({
    queryKey: ['staff-accounts'],
    queryFn: () => api.getStaffAccounts(requireToken(token)),
    enabled: !!token && !!capabilities?.manage_settings,
  });
}

export function useCreateStaffAccount() {
  const { token } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; email: string; role: StaffRole }) => api.createStaffAccount(requireToken(token), input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff-accounts'] }),
  });
}

export function useUpdateStaffAccountRole() {
  const { token } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: StaffRole }) => api.updateStaffAccountRole(requireToken(token), id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff-accounts'] }),
  });
}

export function useDeleteStaffAccount() {
  const { token } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteStaffAccount(requireToken(token), id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff-accounts'] }),
  });
}

export function useMessages(bookingId: string | undefined) {
  const { token, capabilities } = useSession();
  return useQuery({
    queryKey: ['messages', bookingId],
    queryFn: () => api.getMessages(requireToken(token), bookingId as string),
    // Matches the server gate exactly (fifi_edit_bookings) — Finance never
    // sees this query fire, since they never have that capability.
    enabled: !!token && !!bookingId && !!capabilities?.edit_bookings,
  });
}

export function useSendMessage(bookingId: string) {
  const { token } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ body, type }: { body: string; type?: MessageType }) => api.sendMessage(requireToken(token), bookingId, body, type),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages', bookingId] }),
  });
}

export function useTasks() {
  const { token, capabilities } = useSession();
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.getTasks(requireToken(token)),
    enabled: !!token && !!capabilities?.view_all_bookings,
  });
}
