import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TRANSACTIONS: '@transactions',
  CATEGORIES: '@categories',
};

export const initDatabase = async () => {
  try {
    const categories = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!categories) {
      const defaultCategories = [
        { id: '1', name: 'Продукты', icon: '🍎', color: '#4CAF50', type: 'expense' },
        { id: '2', name: 'Транспорт', icon: '🚗', color: '#2196F3', type: 'expense' },
        { id: '3', name: 'Развлечения', icon: '🎮', color: '#9C27B0', type: 'expense' },
        { id: '4', name: 'Рестораны', icon: '🍔', color: '#FF9800', type: 'expense' },
        { id: '5', name: 'Покупки', icon: '🛍️', color: '#E91E63', type: 'expense' },
        { id: '6', name: 'Здоровье', icon: '💊', color: '#00BCD4', type: 'expense' },
        { id: '7', name: 'Образование', icon: '📚', color: '#3F51B5', type: 'expense' },
        { id: '8', name: 'Другое', icon: '📦', color: '#607D8B', type: 'expense' },
        { id: '9', name: 'Зарплата', icon: '💰', color: '#4CAF50', type: 'income' },
        { id: '10', name: 'Подарки', icon: '🎁', color: '#FF4081', type: 'income' },
        { id: '11', name: 'Инвестиции', icon: '📈', color: '#009688', type: 'income' },
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
    }
  } catch (error) {
    console.error('DB init error:', error);
  }
};

export const getTransactions = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

export const addTransaction = async (transaction) => {
  try {
    const transactions = await getTransactions();
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    transactions.push(newTransaction);
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return newTransaction;
  } catch (error) {
    throw error;
  }
};

export const deleteTransaction = async (id) => {
  try {
    const transactions = await getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));
  } catch (error) {
    throw error;
  }
};

export const getCategories = async (type = null) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const categories = data ? JSON.parse(data) : [];
    return type ? categories.filter(c => c.type === type) : categories;
  } catch (error) {
    return [];
  }
};
