import { createSlice } from '@reduxjs/toolkit';
import designService from '../services/designs';

// Slice for managing designs state
const designSlice = createSlice({
  name: 'designs',
  initialState: [], // Initial state is an empty array
  reducers: {
    // Replace the entire designs state
    setDesigns(_, action) {
      return action.payload;
    },
    // Add a new design to the existing array
    appendDesign(state, action) {
      state.push(action.payload);
    },
  },
});

// Async thunk to fetch all designs from the server
export const initializeDesigns = () => {
  return async (dispatch) => {
    const designs = await designService.getAll();
    dispatch(setDesigns(designs));
  };
};

// Async thunk to create a new design
export const createDesign = (newDesign) => {
  return async (dispatch) => {
    const design = await designService.create(newDesign);
    dispatch(appendDesign(design));
    return design; // return the created design for further use
  };
};

// Async thunk to update an existing design
export const updateDesign = (updatedDesign) => {
  return async (dispatch, getState) => {
    await designService.update(updatedDesign.id, updatedDesign);

    // Update state by replacing the updated design
    const { designs } = getState();
    const updatedDesigns = designs.map((design) =>
      design.id === updatedDesign.id ? updatedDesign : design
    );
    dispatch(setDesigns(updatedDesigns));
  };
};

// Async thunk to delete a design by ID
export const deleteDesign = (id) => {
  return async (dispatch, getState) => {
    await designService.remove(id);

    // Remove the deleted design from state
    const { designs } = getState();
    const updatedDesigns = designs.filter((design) => design.id !== id);
    dispatch(setDesigns(updatedDesigns));
  };
};

// Export actions for internal use
export const { setDesigns, appendDesign } = designSlice.actions;
export default designSlice.reducer;
