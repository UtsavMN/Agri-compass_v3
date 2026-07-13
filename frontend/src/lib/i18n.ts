import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.dashboard': 'Dashboard',
      'nav.myFarm': 'My Farm',
      'nav.marketPrices': 'Market Prices',
      'nav.govSchemes': 'Gov Schemes',
      'nav.aiAgent': 'AI Agent',
      'nav.weather': 'Weather',
      'nav.community': 'Community',
      'nav.profile': 'Profile',

      // Common
      'common.loading': 'Loading...',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.submit': 'Submit',
      'common.back': 'Back',
      'common.next': 'Next',
      'common.previous': 'Previous',
      'common.close': 'Close',
      'common.ok': 'OK',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.confirm': 'Confirm',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.warning': 'Warning',
      'common.info': 'Information',

      // Auth
      'auth.signIn': 'Sign In',
      'auth.signUp': 'Sign Up',
      'auth.signOut': 'Sign Out',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.confirmPassword': 'Confirm Password',
      'auth.forgotPassword': 'Forgot Password?',
      'auth.resetPassword': 'Reset Password',
      'auth.noAccount': "Don't have an account?",
      'auth.haveAccount': 'Already have an account?',
      'auth.welcome': 'Welcome to Agri Compass',

      // Dashboard
      'dashboard.title': 'Dashboard',
      'dashboard.welcome': 'Welcome back',
      'dashboard.quickActions': 'Quick Actions',
      'dashboard.recentActivity': 'Recent Activity',
      'dashboard.weather': 'Weather',
      'dashboard.marketPrices': 'Market Prices',
      'dashboard.crops': 'Popular Crops',
      'dashboard.farms': 'My Farms',

      // Farm
      'farm.title': 'My Farm',
      'farm.addFarm': 'Add Farm',
      'farm.farmName': 'Farm Name',
      'farm.location': 'Location',
      'farm.area': 'Area (acres)',
      'farm.soilType': 'Soil Type',
      'farm.irrigation': 'Irrigation Type',
      'farm.noFarms': 'No farms yet',
      'farm.addFirstFarm': 'Add your first farm to start managing crops and tracking yields',
      'farm.addFarmButton': 'Add Your First Farm',

      // Weather
      'weather.title': 'Weather',
      'weather.current': 'Current Weather',
      'weather.forecast': '5-Day Forecast',
      'weather.temperature': 'Temperature',
      'weather.humidity': 'Humidity',
      'weather.windSpeed': 'Wind Speed',
      'weather.description': 'Description',
      'weather.precipitation': 'Precipitation',

      // Market Prices
      'market.title': 'Market Prices',
      'market.currentPrices': 'Current Market Prices',
      'market.priceTrends': 'Price Trends',
      'market.crop': 'Crop',
      'market.price': 'Price',
      'market.change': 'Change',

      // AI Agent
      'ai.title': 'AI Agent',
      'ai.placeholder': 'Ask about crops, weather, or farming advice...',
      'ai.send': 'Send',
      'ai.listening': 'Listening... Speak now or click mic to stop',
      'ai.thinking': 'AI is thinking',

      // Community
      'community.title': 'Community',
      'community.posts': 'Posts',
      'community.createPost': 'Create Post',
      'community.noPosts': 'No posts yet',
      'community.beFirst': 'Be the first to share your farming experience!',
      'community.postContent': 'What would you like to share?',
      'community.addImage': 'Add Image',
      'community.post': 'Post',

      // Posts
      'post.like': 'Like',
      'post.comment': 'Comment',
      'post.share': 'Share',
      'post.likes': 'likes',
      'post.comments': 'comments',
      'post.delete': 'Delete post',
      'post.edit': 'Edit post',

      // Language
      'lang.english': 'English',
      'lang.kannada': 'ಕನ್ನಡ',
      'lang.switchTo': 'Switch to',

      // Accessibility
      'a11y.menu': 'Main navigation menu',
      'a11y.themeToggle': 'Toggle theme between light and dark mode',
      'a11y.languageToggle': 'Change language',
      'a11y.closeMenu': 'Close navigation menu',
      'a11y.openMenu': 'Open navigation menu',
      'a11y.loading': 'Content is loading',
      'a11y.error': 'An error occurred',
      'a11y.success': 'Operation completed successfully',

      // Errors
      'error.generic': 'Something went wrong. Please try again.',
      'error.network': 'Network error. Please check your connection.',
      'error.auth': 'Authentication failed. Please sign in again.',
      'error.validation': 'Please check your input and try again.',
      'error.notFound': 'The requested resource was not found.',
      'error.permission': 'You do not have permission to perform this action.',
    }
  },
  kn: {
    translation: {
      // Navigation
      'nav.home': 'ಮುಖ್ಯ ಪುಟ',
      'nav.dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      'nav.myFarm': 'ನನ್ನ ಜಮೀನು',
      'nav.marketPrices': 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು',
      'nav.govSchemes': 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
      'nav.aiAgent': 'AI ಸಹಾಯಕ',
      'nav.weather': 'ಹವಾಮಾನ',
      'nav.community': 'ಸಮುದಾಯ',
      'nav.profile': 'ಪ್ರೊಫೈಲ್',

      // Common
      'common.loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      'common.save': 'ಉಳಿಸಿ',
      'common.cancel': 'ರದ್ದುಗೊಳಿಸಿ',
      'common.delete': 'ಅಳಿಸಿ',
      'common.edit': 'ಸಂಪಾದಿಸಿ',
      'common.add': 'ಸೇರಿಸಿ',
      'common.search': 'ಹುಡುಕಿ',
      'common.filter': 'ಫಿಲ್ಟರ್',
      'common.submit': 'ಸಲ್ಲಿಸಿ',
      'common.back': 'ಹಿಂತಿರುಗಿ',
      'common.next': 'ಮುಂದೆ',
      'common.previous': 'ಹಿಂದಿನ',
      'common.close': 'ಮುಚ್ಚಿ',
      'common.ok': 'ಸರಿ',
      'common.yes': 'ಹೌದು',
      'common.no': 'ಇಲ್ಲ',
      'common.confirm': 'ದೃಢೀಕರಿಸಿ',
      'common.error': 'ದೋಷ',
      'common.success': 'ಯಶಸ್ಸು',
      'common.warning': 'ಎಚ್ಚರಿಕೆ',
      'common.info': 'ಮಾಹಿತಿ',

      // Auth
      'auth.signIn': 'ಲಾಗಿನ್ ಮಾಡಿ',
      'auth.signUp': 'ನೋಂದಣಿ ಮಾಡಿ',
      'auth.signOut': 'ಲಾಗೌಟ್ ಮಾಡಿ',
      'auth.email': 'ಇಮೇಲ್',
      'auth.password': 'ಪಾಸ್‌ವರ್ಡ್',
      'auth.confirmPassword': 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ',
      'auth.forgotPassword': 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿದ್ದೀರಾ?',
      'auth.resetPassword': 'ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ',
      'auth.noAccount': 'ಖಾತೆ ಇಲ್ಲವೇ?',
      'auth.haveAccount': 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?',
      'auth.welcome': 'ಅಗ್ರಿ ಕಂಪಾಸ್‌ಗೆ ಸ್ವಾಗತ',

      // Dashboard
      'dashboard.title': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      'dashboard.welcome': 'ಮರಳಿ ಸ್ವಾಗತ',
      'dashboard.quickActions': 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು',
      'dashboard.recentActivity': 'ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ',
      'dashboard.weather': 'ಹವಾಮಾನ',
      'dashboard.marketPrices': 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು',
      'dashboard.crops': 'ಜನಪ್ರಿಯ ಬೆಳೆಗಳು',
      'dashboard.farms': 'ನನ್ನ ಜಮೀನುಗಳು',

      // Farm
      'farm.title': 'ನನ್ನ ಜಮೀನು',
      'farm.addFarm': 'ಜಮೀನು ಸೇರಿಸಿ',
      'farm.farmName': 'ಜಮೀನಿನ ಹೆಸರು',
      'farm.location': 'ಸ್ಥಳ',
      'farm.area': 'ವಿಸ್ತೀರ್ಣ (ಎಕರೆಗಳು)',
      'farm.soilType': 'ಮಣ್ಣಿನ ಪ್ರಕಾರ',
      'farm.irrigation': 'ನೀರಾವರಿ ಪ್ರಕಾರ',
      'farm.noFarms': 'ಇನ್ನೂ ಜಮೀನುಗಳಿಲ್ಲ',
      'farm.addFirstFarm': 'ಬೆಳೆಗಳನ್ನು ನಿರ್ವಹಿಸಲು ಮತ್ತು ಉತ್ಪಾದನೆಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ನಿಮ್ಮ ಮೊದಲ ಜಮೀನನ್ನು ಸೇರಿಸಿ',
      'farm.addFarmButton': 'ನಿಮ್ಮ ಮೊದಲ ಜಮೀನು ಸೇರಿಸಿ',

      // Weather
      'weather.title': 'ಹವಾಮಾನ',
      'weather.current': 'ಪ್ರಸ್ತುತ ಹವಾಮಾನ',
      'weather.forecast': '5-ದಿನದ ಮುನ್ಸೂಚನೆ',
      'weather.temperature': 'ತಾಪಮಾನ',
      'weather.humidity': 'ಆರ್ದ್ರತೆ',
      'weather.windSpeed': 'ಗಾಳಿಯ ವೇಗ',
      'weather.description': 'ವಿವರಣೆ',
      'weather.precipitation': 'ಮಳೆ',

      // Market Prices
      'market.title': 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು',
      'market.currentPrices': 'ಪ್ರಸ್ತುತ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು',
      'market.priceTrends': 'ಬೆಲೆಯ ಟ್ರೆಂಡ್‌ಗಳು',
      'market.crop': 'ಬೆಳೆ',
      'market.price': 'ಬೆಲೆ',
      'market.change': 'ಬದಲಾವಣೆ',

      // AI Agent
      'ai.title': 'AI ಸಹಾಯಕ',
      'ai.placeholder': 'ಬೆಳೆಗಳು, ಹವಾಮಾನ ಅಥವಾ ಕೃಷಿ ಸಲಹೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ...',
      'ai.send': 'ಕಳುಹಿಸಿ',
      'ai.listening': 'ಕೇಳುತ್ತಿದೆ... ಈಗ ಮಾತನಾಡಿ ಅಥವಾ ಮೈಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ ನಿಲ್ಲಿಸಿ',
      'ai.thinking': 'AI ಯೋಚಿಸುತ್ತಿದೆ',

      // Community
      'community.title': 'ಸಮುದಾಯ',
      'community.posts': 'ಪೋಸ್ಟ್‌ಗಳು',
      'community.createPost': 'ಪೋಸ್ಟ್ ರಚಿಸಿ',
      'community.noPosts': 'ಇನ್ನೂ ಪೋಸ್ಟ್‌ಗಳಿಲ್ಲ',
      'community.beFirst': 'ನಿಮ್ಮ ಕೃಷಿ ಅನುಭವವನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ಮೊದಲಿಗರಾಗಿ!',
      'community.postContent': 'ನೀವು ಏನು ಹಂಚಿಕೊಳ್ಳಲು ಬಯಸುತ್ತೀರಿ?',
      'community.addImage': 'ಚಿತ್ರ ಸೇರಿಸಿ',
      'community.post': 'ಪೋಸ್ಟ್',

      // Posts
      'post.like': 'ಲೈಕ್',
      'post.comment': 'ಕಾಮೆಂಟ್',
      'post.share': 'ಹಂಚಿಕೊಳ್ಳಿ',
      'post.likes': 'ಲೈಕ್‌ಗಳು',
      'post.comments': 'ಕಾಮೆಂಟ್‌ಗಳು',
      'post.delete': 'ಪೋಸ್ಟ್ ಅಳಿಸಿ',
      'post.edit': 'ಪೋಸ್ಟ್ ಸಂಪಾದಿಸಿ',

      // Language
      'lang.english': 'English',
      'lang.kannada': 'ಕನ್ನಡ',
      'lang.switchTo': 'ಬದಲಾಯಿಸಿ',

      // Accessibility
      'a11y.menu': 'ಮುಖ್ಯ ನ್ಯಾವಿಗೇಶನ್ ಮೆನು',
      'a11y.themeToggle': 'ಲೈಟ್ ಮತ್ತು ಡಾರ್ಕ್ ಮೋಡ್ ನಡುವೆ ಟಾಗಲ್ ಮಾಡಿ',
      'a11y.languageToggle': 'ಭಾಷೆ ಬದಲಾಯಿಸಿ',
      'a11y.closeMenu': 'ನ್ಯಾವಿಗೇಶನ್ ಮೆನು ಮುಚ್ಚಿ',
      'a11y.openMenu': 'ನ್ಯಾವಿಗೇಶನ್ ಮೆನು ತೆರೆಯಿರಿ',
      'a11y.loading': 'ಕಂಟೆಂಟ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ',
      'a11y.error': 'ದೋಷ ಸಂಭವಿಸಿದೆ',
      'a11y.success': 'ಕಾರ್ಯವು ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ',

      // Errors
      'error.generic': 'ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
      'error.network': 'ನೆಟ್‌ವರ್ಕ್ ದೋಷ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ.',
      'error.auth': 'ದೃಢೀಕರಣ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.',
      'error.validation': 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇನ್‌ಪುಟ್ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
      'error.notFound': 'ವಿನಂತಿಸಿದ ಸಂಪನ್ಮೂಲ ಕಂಡುಬಂದಿಲ್ಲ.',
      'error.permission': 'ಈ ಕ್ರಿಯೆಯನ್ನು ನಿರ್ವಹಿಸಲು ನಿಮಗೆ ಅನುಮತಿ ಇಲ್ಲ.',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
