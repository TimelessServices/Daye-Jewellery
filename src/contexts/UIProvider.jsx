"use client";
import { createContext, useContext, useCallback, useMemo, useReducer } from 'react';

const UIContext = createContext();

const initialState = {
    // Modal system
    modals: {},
    
    // Dropdown states
    dropdowns: {
        cart: false,
        wishlist: false,
        userMenu: false,
        mobileMenu: false
    },
    
    // Loading states
    loading: {
        'navPrimary:search': false,
        'collectionPage:items': false,
        'collectionModal:addToCart': false,
        'itemModal:addToCart': false,
        'itemModal:addToCartSuccess': false,
        'shopPage:gridLoad': false,
        'shopPage:loadMore': false,
        'collectionHeader:addSetToCart': false,
        'collectionHeader:addDealToWishlist': false
    },
    
    // Toast notifications
    toasts: [],
    
    // Overlay states
    overlays: {
        search: false,
        imageZoom: false,
        quickView: false
    },
    
    // Form states
    forms: {
        newsletter: { isSubmitting: false, success: false },
        contact: { isSubmitting: false, success: false }
    }
};

function uiReducer(state, action) {
    switch (action.type) {
        // Modal actions
        case 'OPEN_MODAL':
            return {
                ...state,
                modals: { ...state.modals, [action.id]: action.props }
            };
        case 'CLOSE_MODAL':
            const { [action.id]: removed, ...restModals } = state.modals;
            return { ...state, modals: restModals };
            
        // Dropdown actions
        case 'TOGGLE_DROPDOWN':
            return {
                ...state,
                dropdowns: { 
                    ...Object.keys(state.dropdowns).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
                    [action.dropdown]: !state.dropdowns[action.dropdown] 
                }
            };
        case 'CLOSE_ALL_DROPDOWNS':
            return {
                ...state,
                dropdowns: Object.keys(state.dropdowns).reduce((acc, key) => ({ ...acc, [key]: false }), {})
            };
            
        // Loading actions
        case 'SET_LOADING':
            return {
                ...state,
                loading: { ...state.loading, [action.key]: action.value }
            };
            
        // Toast actions
        case 'ADD_TOAST':
            return {
                ...state,
                toasts: [...state.toasts, { id: Date.now(), ...action.toast }]
            };
        case 'REMOVE_TOAST':
            return {
                ...state,
                toasts: state.toasts.filter(toast => toast.id !== action.id)
            };
            
        // Overlay actions
        case 'TOGGLE_OVERLAY':
            return {
                ...state,
                overlays: { ...state.overlays, [action.overlay]: !state.overlays[action.overlay] }
            };
            
        // Form actions
        case 'SET_FORM_STATE':
            return {
                ...state,
                forms: { 
                    ...state.forms, 
                    [action.form]: { ...state.forms[action.form], ...action.state } 
                }
            };
            
        default:
            return state;
    }
}

export function UIProvider({ children }) {
    const [state, dispatch] = useReducer(uiReducer, initialState);

    const openModal = useCallback((id, props) => 
        dispatch({ type: 'OPEN_MODAL', id, props }), []);
    
    const closeModal = useCallback((id) => 
        dispatch({ type: 'CLOSE_MODAL', id }), []);
    
    const toggleDropdown = useCallback((dropdown) => 
        dispatch({ type: 'TOGGLE_DROPDOWN', dropdown }), []);
    
    const closeAllDropdowns = useCallback(() => 
        dispatch({ type: 'CLOSE_ALL_DROPDOWNS' }), []); 
    
    const setLoading = useCallback((key, value) => 
        dispatch({ type: 'SET_LOADING', key, value }), []);
    
    const addToast = useCallback((toast) => 
        dispatch({ type: 'ADD_TOAST', toast }), []);
    
    const removeToast = useCallback((id) => 
        dispatch({ type: 'REMOVE_TOAST', id }), []);
    
    const toggleOverlay = useCallback((overlay) => 
        dispatch({ type: 'TOGGLE_OVERLAY', overlay }), []);
    
    const setFormState = useCallback((form, stateUpdate) => 
        dispatch({ type: 'SET_FORM_STATE', form, state: stateUpdate }), []);

    const value = useMemo(() => ({
        ...state,
        openModal, closeModal,
        toggleDropdown, closeAllDropdowns,
        setLoading,
        addToast, removeToast,
        toggleOverlay,
        setFormState
    }), [state]);

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

// Export specific hooks
export const useModal = () => {
    const { modals, openModal, closeModal } = useContext(UIContext);
    return { modals, openModal, closeModal };
};

export const useDropdowns = () => {
    const { dropdowns, toggleDropdown, closeAllDropdowns } = useContext(UIContext);
    return { dropdowns, toggleDropdown, closeAllDropdowns };
};

export const useLoading = () => {
    const { loading, setLoading } = useContext(UIContext);
    return { loading, setLoading };
};

export const useToasts = () => {
    const { toasts, addToast, removeToast } = useContext(UIContext);
    return { toasts, addToast, removeToast };
};