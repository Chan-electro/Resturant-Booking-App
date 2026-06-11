"use client";

import React, { createContext, useContext, useReducer, type ReactNode } from "react";
import type { CartItem, Order, OrderStatus, UserRole } from "@/lib/types";
import { mockOrders } from "@/lib/mock-data";

// ===================== STATE =====================

interface AppState {
  cart: CartItem[];
  orders: Order[];
  currentRole: UserRole | null;
  isAuthenticated: boolean;
  userName: string;
}

// ===================== ACTIONS =====================

type Action =
  | { type: "SET_ROLE"; payload: UserRole | null }
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_CART_QTY"; payload: { menuItemId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "PLACE_ORDER"; payload: Order }
  | { type: "UPDATE_ORDER_STATUS"; payload: { id: string; status: OrderStatus } };

// ===================== INITIAL STATE =====================

const initialState: AppState = {
  cart: [],
  orders: mockOrders,
  currentRole: null,
  isAuthenticated: false,
  userName: "Guest",
};

// ===================== REDUCER =====================

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_ROLE":
      return { ...state, currentRole: action.payload };

    case "ADD_TO_CART": {
      const existing = state.cart.find(
        (item) => item.menuItem.id === action.payload.menuItem.id
      );
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.menuItem.id === action.payload.menuItem.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      return { ...state, cart: [...state.cart, action.payload] };
    }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item) => item.menuItem.id !== action.payload),
      };

    case "UPDATE_CART_QTY": {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter(
            (item) => item.menuItem.id !== action.payload.menuItemId
          ),
        };
      }
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.menuItem.id === action.payload.menuItemId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }

    case "CLEAR_CART":
      return { ...state, cart: [] };

    case "PLACE_ORDER":
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        cart: [],
      };

    case "UPDATE_ORDER_STATUS":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.id
            ? { ...o, status: action.payload.status, updatedAt: new Date().toISOString() }
            : o
        ),
      };

    default:
      return state;
  }
}

// ===================== CONTEXT =====================

const AppContext = createContext<
  { state: AppState; dispatch: React.Dispatch<Action> } | undefined
>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}

// ===================== DERIVED STATE HOOKS =====================

export function useCart() {
  const { state, dispatch } = useApp();

  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryFee = subtotal >= 200 ? 0 : 30;
  const total = subtotal + tax + deliveryFee;

  return {
    items: state.cart,
    totalItems,
    subtotal,
    tax,
    deliveryFee,
    total,
    addItem: (item: CartItem) => dispatch({ type: "ADD_TO_CART", payload: item }),
    removeItem: (id: string) => dispatch({ type: "REMOVE_FROM_CART", payload: id }),
    updateQty: (menuItemId: string, quantity: number) =>
      dispatch({ type: "UPDATE_CART_QTY", payload: { menuItemId, quantity } }),
    clearCart: () => dispatch({ type: "CLEAR_CART" }),
  };
}

export function useOrders() {
  const { state, dispatch } = useApp();
  return {
    orders: state.orders,
    placeOrder: (order: Order) => dispatch({ type: "PLACE_ORDER", payload: order }),
    updateStatus: (id: string, status: OrderStatus) =>
      dispatch({ type: "UPDATE_ORDER_STATUS", payload: { id, status } }),
  };
}
