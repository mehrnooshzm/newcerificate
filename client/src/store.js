import { configureStore } from '@reduxjs/toolkit'; // Function to create Redux store
import designReducer from './reducers/designReducer'; // Reducer for designs state

// Configure Redux store
const store = configureStore({
  reducer: {
    designs: designReducer, // Assign designs slice to the store
  },
});

export default store; // Export store for use in the app
