export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Venue {
  name: string;
  address: Address;
}

export interface DateTime {
  start: string;
  end: string;
}

export interface EventDetails {
  type: string;
  childName: string;
  dateTime: DateTime;
  venue: Venue;
  details: string;
}

export interface LineItem {
  description: string;
  quantity: number;
  price: number;
}

export interface PaymentTerms {
  depositDue: string;
  balanceDue: string;
  minimumDeposit: number; // percentage (e.g., 50 for 50%)
}

export interface PaymentHistory {
  date: string;
  type: 'Deposit' | 'Full Payment' | 'Tip';
  amount: number;
  transactionId?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  eventDetails: EventDetails;
  lineItems: LineItem[];
  subtotal: number;
  tax?: number;
  totalAmount: number;
  paymentHistory?: PaymentHistory[];
  memo: string;
  paymentTerms: PaymentTerms;
}