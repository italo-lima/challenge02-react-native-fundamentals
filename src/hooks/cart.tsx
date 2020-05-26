import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const cartProductsStorage = await AsyncStorage.getItem(
        '@cart/GoMarketPlace',
      );
      if (cartProductsStorage) {
        setProducts(JSON.parse(cartProductsStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const findIndex = products.findIndex(
        productCart => productCart.id === product.id,
      );

      if (findIndex >= 0) {
        products[findIndex].quantity += 1;
        setProducts([...products]);
      } else {
        setProducts(oldState => [...oldState, { ...product, quantity: 1 }]);
      }
      await AsyncStorage.setItem(
        '@cart/GoMarketPlace',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const index = products.findIndex(productCart => productCart.id === id);

      if (index >= 0) {
        products[index].quantity += 1;
        setProducts([...products]);

        await AsyncStorage.setItem(
          '@cart/GoMarketPlace',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const index = products.findIndex(productCart => productCart.id === id);

      if (index >= 0 && products[index].quantity >= 1) {
        products[index].quantity -= 1;
        setProducts([...products]);
      }

      await AsyncStorage.setItem(
        '@cart/GoMarketPlace',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
