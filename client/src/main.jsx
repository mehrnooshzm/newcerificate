import { createRoot } from 'react-dom/client'; // React 18 root API
import { Provider } from 'react-redux'; // Redux provider for state management
import store from './store.js'; // Redux store
import App from './App.jsx'; // Main App component
import { AuthProvider } from './context/auth'; // Auth context provider

import './index.css'; // Global styles

// Create React root and render the app
createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Provider>
);
