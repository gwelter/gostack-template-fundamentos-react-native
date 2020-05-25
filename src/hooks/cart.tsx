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
      const localProducts = await AsyncStorage.getItem('@GoMarket');
      if (localProducts) {
        setProducts(JSON.parse(localProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      let newProductsList: Product[] = [];
      const productInCart = products.find(p => p.id === product.id);
      if (!productInCart) {
        newProductsList = [...products, { ...product, quantity: 1 }];
      } else {
        newProductsList = products.map(p => {
          const newProduct = { ...p };
          if (p.id === product.id) {
            newProduct.quantity += 1;
          }
          return newProduct;
        });
      }

      setProducts(newProductsList);
      await AsyncStorage.setItem('@GoMarket', JSON.stringify(newProductsList));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProductsList = products.map(p => {
        const newProduct = { ...p };
        if (p.id === id) {
          newProduct.quantity += 1;
        }
        return newProduct;
      });

      setProducts(newProductsList);
      await AsyncStorage.setItem('@GoMarket', JSON.stringify(newProductsList));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProductsList = products.map(p => {
        const newProduct = { ...p };
        if (p.id === id && p.quantity > 0) {
          newProduct.quantity -= 1;
        }
        return newProduct;
      });

      setProducts(newProductsList);
      await AsyncStorage.setItem('@GoMarket', JSON.stringify(newProductsList));
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
