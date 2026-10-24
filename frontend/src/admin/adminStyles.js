// frontend/src/admin/adminStyles.js
export const styles = {
  // Common gradient backgrounds
  gradientOrange: "bg-gradient-to-br from-cyan-900/30 to-blue-900/30",
  gradientGray: "bg-gradient-to-br from-gray-900/50 to-gray-900/30",
  gradientGrayToGray: "bg-gradient-to-br from-gray-900 to-gray-800",
  
  // Common borders and transitions
  borderGray: "border border-gray-800",
  borderHoverOrange: "hover:border-cyan-500/50 transition-all",
  borderOrange: "border border-cyan-800/50",
  
  // Common rounded corners
  rounded2xl: "rounded-2xl",
  roundedXl: "rounded-xl",
  roundedLg: "rounded-lg",
  roundedFull: "rounded-full",
  
  // Common text colors
  textWhite: "text-white",
  textGray: "text-gray-400",
  textGray300: "text-gray-300",
  textOrange: "text-cyan-400",
  textRed: "text-red-400",
  
  // Common button styles
  buttonPrimary: "px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white",
  buttonSecondary: "bg-gray-800/50 border border-gray-700 px-5 py-2.5 text-gray-300 rounded-xl",
  
  // Common input styles
  inputField: "bg-gray-800/50 border border-gray-700 w-full px-4 py-2.5 text-gray-200 rounded-lg",
  
  // Component-specific styles
  statCard: "p-5 w-full max-w-xs",
  carCard: "overflow-hidden duration-300",
  carImage: "w-full h-48 object-cover",
  statusBadge: "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
  modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50",
  modalContainer: "shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto",
  noCarsContainer: "text-center py-16 rounded-2xl border border-gray-800 mt-8",
  filterSelect: "p-5 w-full max-w-xs"
};

export const bookStyles = {
  gradientOrange: "bg-gradient-to-br from-cyan-900/30 to-blue-900/30",
  gradientGray: "bg-gradient-to-br from-gray-900/50 to-gray-900/30",
  gradientGrayToGray: "bg-gradient-to-br from-gray-900 to-gray-800",
  gradientGrayToGrayLight: "bg-gradient-to-br from-gray-900/30 to-gray-900/10",
  gradientOrangeToAmber: "bg-gradient-to-br from-cyan-800/50 to-blue-800/50",
  gradientOrangeToAmberSolid: "bg-gradient-to-br from-cyan-700 to-blue-700",
  
  borderGray: "border border-gray-800",
  borderHoverOrange: "hover:border-cyan-500/50 transition-all",
  borderOrange: "border border-cyan-800/30",
  borderOrangeLight: "border border-cyan-800/50",
  
  rounded2xl: "rounded-2xl",
  roundedXl: "rounded-xl",
  roundedLg: "rounded-lg",
  roundedFull: "rounded-full",
  
  textWhite: "text-white",
  textGray: "text-gray-400",
  textGray300: "text-gray-300",
  textOrange: "text-cyan-400",
  textRed: "text-red-400",
  textAmber: "text-amber-400",
  textGreen: "text-green-400",
  
  buttonPrimary: "px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white",
  buttonSecondary: "bg-gray-800/50 border border-gray-700 px-5 py-2.5 text-gray-300 rounded-xl",
  
  inputField: "bg-gray-800/50 border border-gray-700 w-full px-4 py-2.5 text-gray-200 rounded-lg",
  
  statCard: "p-5 w-full max-w-xs",
  carCard: "overflow-hidden duration-300",
  carImage: "w-full h-48 object-cover",
  statusBadge: "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
  modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50",
  modalContainer: "shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto",
  noItemsContainer: "text-center py-16 rounded-2xl border border-gray-800",
  filterSelect: "p-5 w-full max-w-xs",
  panel: "bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800",
  specItem: "flex flex-col items-center p-3 rounded-xl border border-gray-800 hover:border-cyan-500/50 transition-all",
  detailItem: "flex items-start",
  bookingCard: "backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-800 hover:border-cyan-500/50 transition-all duration-300",
  searchFilterBar: "backdrop-blur-sm rounded-2xl p-5 mb-6 border border-gray-800"
};

export const AddCarPageStyles = {
  pageContainer: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6",
  fixedBackground: "fixed inset-0 overflow-hidden pointer-events-none",
  gradientBlob1: "absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-cyan-600 to-blue-800 blur-3xl opacity-10",
  gradientBlob2: "absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-gradient-to-r from-cyan-600 to-blue-800 blur-3xl opacity-10",
  gradientBlob3: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rotate-45 bg-gradient-to-r from-cyan-500 to-blue-500 blur-xl opacity-10",

  headerContainer: "relative mb-8 pt-20 text-center",
  headerDivider: "absolute inset-x-0 top-0 flex justify-center",
  headerDividerLine: "h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full",
  title: "text-4xl font-extrabold py-4 text-white sm:text-5xl mb-3 tracking-wide",
  titleGradient: "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400",
  subtitle: "text-lg text-gray-400 max-w-2xl mx-auto",

  formContainer: "max-w-4xl mx-auto",
  form: "glass-card rounded-2xl shadow-xl p-6 sm:p-10 relative overflow-hidden border border-gray-700",
  formGrid: "grid grid-cols-1 lg:grid-cols-2 gap-8",
  formColumn: "space-y-6",
  formGridInner: "grid grid-cols-1 sm:grid-cols-2 gap-4",

  label: "block text-sm font-medium text-gray-300 mb-2",
  labelWithIcon: "block text-sm font-medium text-gray-300 mb-2 flex items-center",
  input: "glass-input w-full px-4 py-3 rounded-xl text-gray-200 shadow-sm focus:ring-2 focus:ring-cyan-500 transition-all",
  inputWithPrefix: "glass-input w-full pl-8 pr-4 py-3 rounded-xl text-gray-200 shadow-sm focus:ring-2 focus:ring-cyan-500 transition-all",
  select: "bg-gray-800/50 border border-gray-700 w-full px-4 py-3 rounded-xl text-gray-200 focus:ring-2 focus:ring-cyan-500",
  textarea: "glass-input w-full px-4 py-3 rounded-xl text-gray-200 shadow-sm focus:ring-2 focus:ring-cyan-500 transition-all",

  radioContainer: "flex space-x-4",
  radioLabel: (isSelected) => 
    `flex-1 flex items-center justify-center p-3 rounded-xl cursor-pointer transition-all hover:shadow-md ${
      isSelected
        ? "bg-gradient-to-r from-cyan-700/30 to-blue-700/30 border border-cyan-500/50"
        : "glass-input"
    }`,
  radioInput: "h-4 w-4 text-cyan-500 focus:ring-cyan-500",
  radioText: "ml-2 text-gray-300",

  imageUploadContainer: "flex items-center justify-center w-full",
  imageUploadLabel: "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-2xl cursor-pointer glass-input shadow-sm hover:bg-gray-900/30 transition-all",
  imageUploadPlaceholder: "flex flex-col items-center justify-center pt-5 pb-6",
  imageUploadIcon: "w-10 h-10 mb-3 text-gray-500",
  imageUploadText: "text-sm text-gray-400 text-center",
  imageUploadTextSemibold: "font-semibold",
  imageUploadSubText: "text-xs text-gray-500 mt-1",

  submitButton: "px-10 py-4 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:ring-opacity-50 text-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500",
  buttonText: "drop-shadow-md",

  iconSmall: "w-5 h-5 mr-2 text-cyan-500",
  iconMedium: "w-6 h-6 mr-2 text-red-400",
  iconLarge: "w-8 h-8 mr-3 text-cyan-400",
  iconInline: "w-5 h-5 ml-2 inline",
  iconUpload: "w-10 h-10 mb-3 text-gray-500",
};

export const toastStyles = {
  success: {
    container: "bg-gradient-to-r from-gray-800 to-gray-900 border-l-4 border-cyan-500",
    body: "font-sans text-gray-100",
  },
  error: {
    container: "bg-gradient-to-r from-gray-800 to-gray-900",
    body: "font-sans text-gray-100",
  },
};

export const BookingPageStyles = {
  pageContainer: "min-h-screen bg-gray-950 p-4 sm:p-6",
  fixedBackground: "fixed inset-0 overflow-hidden pointer-events-none",
  gradientBlob1: "absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-cyan-600 to-blue-800 blur-3xl opacity-10",
  gradientBlob2: "absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-gradient-to-r from-cyan-600 to-blue-800 blur-3xl opacity-10",
  gradientBlob3: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rotate-45 bg-gradient-to-r from-cyan-500 to-blue-500 blur-xl opacity-10",

  headerContainer: "relative mb-8 pt-16 text-center",
  headerDivider: "absolute inset-x-0 top-0 flex justify-center",
  headerDividerLine: "h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full",
  title: "text-4xl font-extrabold py-4 text-white sm:text-5xl mb-3 tracking-wide",
  titleGradient: "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400",
  subtitle: "text-gray-400 max-w-2xl mx-auto",

  searchFilterContainer: "bg-gray-900/50 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-gray-800",
  searchFilterGrid: "grid grid-cols-1 md:grid-cols-3 gap-4",
  filterLabel: "block text-sm font-medium text-gray-400 mb-2",
  filterInput: "bg-gray-800/50 border border-gray-700 w-full px-4 py-2.5 pl-10 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500",
  filterIconContainer: "absolute left-3 top-3 text-cyan-500",
  totalBookingsContainer: "bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-lg p-4 border border-cyan-800/30 flex items-center justify-center",
  totalBookingsLabel: "text-gray-400 text-sm mb-1",
  totalBookingsValue: "text-2xl font-bold text-cyan-400",

  bookingCard: "bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-800 hover:border-cyan-500/50 transition-all duration-300",
  bookingCardHeader: "flex items-center mb-4 md:mb-0",
  bookingIconContainer: "bg-gradient-to-br from-cyan-800/50 to-blue-800/50 p-3 rounded-xl mr-4",
  bookingIcon: "text-cyan-400 text-xl",
  bookingCustomer: "text-lg font-bold text-white",
  bookingEmail: "text-sm text-gray-400",
  bookingExpandIcon: "flex items-center text-cyan-400 ml-auto md:hidden",
  bookingInfoGrid: "grid grid-cols-2 sm:grid-cols-4 gap-4",
  bookingInfoLabel: "text-xs text-gray-400",
  bookingInfoValue: "text-sm font-medium text-white",
  bookingAmount: "text-sm font-semibold text-cyan-400",
  bookingActions: "flex justify-between items-center mt-4",
  bookingActionButton: (color) => `bg-gradient-to-r from-${color}-700/50 to-${color}-800/50 text-${color}-300 hover:text-white transition-colors text-sm px-3 py-1 rounded-lg`,
  bookingEditButton: "bg-gradient-to-r from-cyan-700/50 to-blue-700/50 text-cyan-300 hover:text-white text-sm px-3 py-1 rounded-lg flex items-center",
  bookingDetails: "border-t border-gray-800 p-5 bg-gradient-to-br from-gray-900/30 to-gray-900/10",
  bookingDetailsGrid: "grid grid-cols-1 md:grid-cols-2 gap-6",

  panel: "bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800",
  panelTitle: "text-md font-bold text-white mb-4 flex items-center",
  panelIcon: "mr-2 text-cyan-400",

  detailContainer: "flex items-start",
  detailIcon: "text-cyan-400 mt-1 mr-3",
  detailLabel: "text-xs text-gray-400",
  detailValue: "text-sm font-medium text-white",

  specContainer: "flex flex-col items-center bg-gradient-to-br from-gray-900/30 to-gray-900/10 p-3 rounded-xl border border-gray-800 hover:border-cyan-500/50 transition-all",
  specIcon: "text-xl mb-2 text-cyan-400",
  specLabel: "text-xs text-gray-400",
  specValue: "font-semibold text-sm text-white",

  statusIndicator: (status) => {
    const config = {
      completed: "bg-green-900/20 text-green-400",
      pending: "bg-amber-900/20 text-amber-400",
      active: "bg-cyan-900/20 text-cyan-400",
      cancelled: "bg-red-900/20 text-red-400",
      default: "bg-gray-900/30 text-gray-400"
    };
    return `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config[status] || config.default}`;
  },
  statusIcon: (status) => {
    const config = {
      completed: "bg-green-500",
      pending: "bg-amber-500",
      active: "bg-cyan-500",
      cancelled: "bg-red-500",
      default: "bg-gray-500"
    };
    return `w-2 h-2 rounded-full mr-2 ${config[status] || config.default}`;
  },

  noBookingsContainer: "bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm text-center py-16 rounded-2xl border border-gray-800",
  noBookingsIconContainer: "mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-cyan-900/30 to-blue-900/30 flex items-center justify-center mb-6",
  noBookingsIcon: "bg-gradient-to-br from-cyan-700 to-blue-700 w-16 h-16 rounded-full flex items-center justify-center",
  noBookingsIconSvg: "h-8 w-8 text-cyan-300",
  noBookingsTitle: "mt-4 text-xl font-medium text-white",
  noBookingsText: "mt-2 text-gray-400",
  noBookingsButton: "mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white flex items-center mx-auto",

  carImageContainer: "bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-xl w-20 h-12 flex items-center justify-center",
};

export const statusConfig = {
  completed: { bg: "bg-green-900/20", text: "text-green-400" },
  pending: { bg: "bg-amber-900/20", text: "text-amber-400" },
  active: { bg: "bg-cyan-900/20", text: "text-cyan-400" },
  cancelled: { bg: "bg-red-900/20", text: "text-red-400" },
  default: { bg: "bg-gray-900/30", text: "text-gray-400" }
};

export const navbarStyles = {
  navbar: (scrolled) => `fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? "py-2 sm:py-3" : "py-3 sm:py-5"}`,
  navbarInner: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  navbarCenter: "flex justify-center",
  navbarBackground: (scrolled) => `bg-white/95 backdrop-blur-md w-full rounded-full shadow-xl border border-gray-200 transition-all duration-300 ${scrolled ? "py-2 px-4 sm:px-6" : "py-2.5 sm:py-3 px-5 sm:px-8"}`,
  contentContainer: "flex justify-between items-center h-full",
  logoLink: "flex items-center",
  logoContainer: "flex items-center gap-2",
  logoImage: "h-7 w-auto block",
  logoText: "font-extrabold tracking-wider text-gray-900 text-base sm:text-lg flex items-center gap-1.5",
  desktopNav: "hidden md:flex items-center",
  navLinksContainer: "flex space-x-1 sm:space-x-2 mx-4",
  navLink: "flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 hover:text-cyan-600 rounded-lg transition-colors duration-200",
  navLinkActive: "flex items-center gap-2 px-3 py-2 text-sm font-bold text-cyan-600 bg-cyan-50 rounded-lg transition-colors duration-200",
  navDivider: "h-5 w-px bg-gray-300 my-auto",
  mobileMenuButton: "md:hidden flex items-center",
  menuButton: "text-gray-700 hover:text-cyan-600 p-2 rounded-lg focus:outline-none",
  mobileMenu: "md:hidden bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl mx-4 mt-2 overflow-hidden",
  mobileMenuContainer: "p-3 space-y-1.5",
  mobileNavLink: "flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 font-medium text-sm transition-colors",
  mobileNavLinkActive: "flex items-center gap-3 px-4 py-3 rounded-xl text-cyan-600 bg-cyan-50 font-bold text-sm transition-colors",
};
