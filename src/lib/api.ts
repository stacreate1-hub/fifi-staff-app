/**
 * Typed client for the Fifi Portal API (Phase 1) — see
 * fifi-portal-api-v2.php. Base URL is environment-configurable so the app
 * can point at staging today and production later with no code change.
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://staging.fificapturestudio.com';
const API_PREFIX = '/wp-json/fifi/v1';

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export interface Capabilities {
  view_bookings: boolean;
  create_bookings: boolean;
  edit_bookings: boolean;
  manage_payments: boolean;
  manage_refunds: boolean;
  cancel_bookings: boolean;
  manage_clients: boolean;
  view_activity_log: boolean;
  manage_settings: boolean;
  view_all_bookings: boolean;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    roles: string[];
  };
  capabilities: Capabilities;
  expires_at: number;
}

export interface Payment {
  amount: number;
  method: string;
  reference?: string;
  note?: string;
  paid_at: string;
  type?: 'refund';
}

export type BookingStatus =
  | 'Awaiting Payment'
  | 'Booking Confirmed'
  | 'Payment Arrangement'
  | 'Refunded'
  | 'Cancelled';

export interface Booking {
  booking_id: string;
  name: string;
  service: string;
  package: string;
  event_date: string;
  venue: string;
  guests: string | number;
  add_ons?: string;
  total_amount: number;
  deposit_amount: number;
  balance_due: number;
  booking_status: BookingStatus;
  deposit_paid: boolean;
  paid_in_full: boolean;
  payments?: Payment[];
  created_at: string;
  assigned_photographer?: number;
  client: {
    user_id: number;
    name: string;
    email: string;
  };
  // Booking rows carry several optional, loosely-structured fields
  // (travel_zone, pay_choice, source, documents, ...) depending on how the
  // booking was created — accessed via bracket notation where needed
  // rather than typed exhaustively here.
  [key: string]: unknown;
}

export type EnquiryStage = 'new' | 'contacted' | 'consultation' | 'quote' | 'won' | 'lost' | 'general';

export interface Enquiry {
  id: number;
  stage: EnquiryStage;
  name: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  booking_id: string;
  next_followup: string;
  notes: string;
  created_at: number;
}

export interface ReportsResponse {
  period: 'cal' | 'tax';
  year: number;
  label: string;
  received: number;
  refunds: number;
  net: number;
  outstanding: number;
  jobs: number;
  completed: number;
  upcoming: number;
  by_month: Record<string, number>;
  by_type: Record<string, { count: number; value: number }>;
}

async function request<T>(
  path: string,
  options: { method?: string; token?: string; body?: Record<string, unknown> } = {}
): Promise<T> {
  const { method = 'GET', token, body } = options;

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let fetchBody: BodyInit | undefined;
  if (body) {
    // Mirrors what the PHP side expects (application/x-www-form-urlencoded,
    // read via $request->get_param()) rather than a JSON body.
    const form = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined && value !== null) form.append(key, String(value));
    }
    fetchBody = form.toString();
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  const res = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, { method, headers, body: fetchBody });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json() : null;

  if (!res.ok) {
    const code = payload?.code ?? 'unknown_error';
    const message = payload?.message ?? `Request failed with status ${res.status}`;
    throw new ApiError(res.status, code, message);
  }

  return payload as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', { method: 'POST', body: { email, password } }),

  getBookings: (token: string) => request<Booking[]>('/bookings', { token }),

  getBooking: (token: string, bookingId: string) => request<Booking>(`/bookings/${bookingId}`, { token }),

  getPayments: (token: string, bookingId: string) => request<Payment[]>(`/payments/${bookingId}`, { token }),

  getBalance: (token: string, bookingId: string) => request<{ balance: number }>(`/balance/${bookingId}`, { token }),

  createBooking: (
    token: string,
    input: {
      name: string;
      email: string;
      phone?: string;
      booking_name?: string;
      service?: string;
      package?: string;
      event_date?: string; // YYYY-MM-DD
      venue?: string;
      guests?: number;
      total: number;
      deposit?: number;
      note?: string;
    }
  ) => request<{ booking_id: string; user_id: number }>('/bookings', { method: 'POST', token, body: input }),

  recordPayment: (token: string, bookingId: string, amount: number, method?: string) =>
    request<{ ok: boolean; booking: Booking }>(`/bookings/${bookingId}/payments`, {
      method: 'POST',
      token,
      body: { amount, method },
    }),

  recordRefund: (
    token: string,
    bookingId: string,
    input: { amount: number; method?: string; reference?: string; note?: string; new_status?: BookingStatus }
  ) => request<{ ok: boolean; booking: Booking }>(`/bookings/${bookingId}/refunds`, { method: 'POST', token, body: input }),

  updateStatus: (token: string, bookingId: string, status: BookingStatus) =>
    request<{ ok: boolean; booking: Booking }>(`/bookings/${bookingId}/status`, { method: 'PATCH', token, body: { status } }),

  getEnquiries: (token: string, stage?: EnquiryStage) =>
    request<Enquiry[]>(`/enquiries${stage ? `?stage=${stage}` : ''}`, { token }),

  updateEnquiry: (
    token: string,
    id: number,
    input: { stage?: EnquiryStage; next_followup?: string; notes?: string }
  ) => request<Enquiry>(`/enquiries/${id}`, { method: 'PATCH', token, body: input }),

  getReports: (token: string, period: 'calendar' | 'tax_year' = 'calendar', year?: number) =>
    request<ReportsResponse>(`/reports?period=${period}${year ? `&year=${year}` : ''}`, { token }),
};
