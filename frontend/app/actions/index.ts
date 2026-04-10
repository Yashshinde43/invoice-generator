// Auth actions
export { signIn, signUp, signOut, getCurrentUserId } from './auth-firebase'

// Business actions
export {
  getUserBusiness,
  getUserBusinesses,
  createBusiness,
  updateBusiness,
  setDefaultBusiness,
  deleteBusiness,
} from './business-firebase'

// Product actions
export {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  adjustProductStock,
  deleteProduct,
  type Product,
} from './products-firebase'

// Invoice actions
export {
  getInvoices,
  getRecentInvoices,
  getInvoice,
  getDashboardStats,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  updateInvoicePaymentStatus,
  deleteInvoice,
  type Invoice,
  type InvoiceItem,
} from './invoices-firebase'

// Dashboard chart actions
export {
  getSalesChartData,
  getProfitChartData,
  getTopProductsData,
  getPaymentStatusData,
} from './dashboard'