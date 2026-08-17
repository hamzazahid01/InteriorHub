export const phoneDisplay = "+971559751474";
export const whatsappNumber = "971559751474";
export const whatsappMessage =
  "Hello, I would like to inquire about your products and services.";

export const getWhatsappUrl = (message = whatsappMessage) =>
  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

export const getTelLink = () => `tel:${phoneDisplay}`;
