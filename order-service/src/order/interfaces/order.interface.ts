export interface Order {
  customerEmail: string;
  menuItems: string[];
  status: 'Pending' | 'Processed';
}
