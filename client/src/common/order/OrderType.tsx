export interface Product {
  _id: string;
  productId: string;
  author: {
    _id: string;
    name: string;
  };
  postInfo: {
    title: string;
    images: string[];
  };
  productInfo: {
    price: number;
    image: string;
  };
  quantity: number;
}

export interface GroupedProducts {
  [key: string]: Product[];
}

export interface Notes {
  [key: string]: string;
}

export interface FormData {
  recipientName: string;
  phoneNumber: string;
  address: string;
  paymentMethod: "qr_code" | "credit_card";
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  fee: number;
  estimatedDays: string;
}

export interface SelectedShipping {
  [key: string]: ShippingMethod;
}

// Constants
export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "standard",
    name: "Standard Delivery",
    fee: 3.5,
    estimatedDays: "3-5 business days"
  },
  {
    id: "express",
    name: "Express Delivery",
    fee: 7.0,
    estimatedDays: "1-2 business days"
  },
  {
    id: "same_day",
    name: "Same Day Delivery",
    fee: 12.0,
    estimatedDays: "Today"
  }
];

// Validation functions
export const validateRecipientName = (name: string): string => {
  if (!name.trim()) return "Recipient name is required";
  if (name.length < 2) return "Name must be at least 2 characters";
  return "";
};

export const validatePhoneNumber = (phone: string): string => {
  if (!phone.trim()) return "Phone number is required";
  if (!/^\d{10}$/.test(phone)) return "Phone number must be 10 digits";
  return "";
};

export const validateAddress = (address: string): string => {
  if (!address.trim()) return "Address is required";
  if (address.length < 10) return "Please enter a complete address";
  return "";
};

export const validateCardNumber = (cardNumber: string): string => {
  if (!cardNumber.trim()) return "Card number is required";
  if (!/^\d{16}$/.test(cardNumber)) return "Must be 16 digits";
  return "";
};

export const validateCardHolder = (cardHolder: string): string => {
  if (!cardHolder.trim()) return "Card holder name is required";
  if (cardHolder.length < 2) return "Please enter a valid name";
  return "";
};

export const validateExpiryDate = (expiryDate: string): string => {
  if (!expiryDate) return "Expiry date is required";
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) return "Must be in MM/YY format";

  const [month, year] = expiryDate.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  if (parseInt(year) < currentYear ||
     (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
    return "Card has expired";
  }
  return "";
};

export const validateCVV = (cvv: string): string => {
  if (!cvv.trim()) return "CVV is required";
  if (!/^\d{3,4}$/.test(cvv)) return "Must be 3 or 4 digits";
  return "";
};

// Helper function to validate entire form
export const validateOrderForm = (formData: FormData): Partial<FormData> => {
  const errors: Partial<FormData> = {};

  errors.recipientName = validateRecipientName(formData.recipientName);
  errors.phoneNumber = validatePhoneNumber(formData.phoneNumber);
  errors.address = validateAddress(formData.address);

  if (formData.paymentMethod === "credit_card") {
    errors.cardNumber = validateCardNumber(formData.cardNumber || "");
    errors.cardHolder = validateCardHolder(formData.cardHolder || "");
    errors.expiryDate = validateExpiryDate(formData.expiryDate || "");
    errors.cvv = validateCVV(formData.cvv || "");
  }

  return errors;
};

// Helper function to calculate order total
export const calculateOrderTotal = (
  products: Product[],
  shippingFee: number
): number => {
  const subtotal = products.reduce(
    (sum, item) => sum + (item.productInfo?.price || 0) * item.quantity,
    0
  );
  return subtotal + shippingFee;
};
