import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../context/LanguageContext';
import { getTransactions, getCategories } from '../database/database';

const HomeScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('month');

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    const [transData, catData] = await Promise.all([getTransactions(), getCategories()]);
    setTransactions(transData);
    setCategories(catData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const calculateStats = () => {
    const now = new Date();
    const start = new Date();
    if (period === 'week') start.setDate(now.getDate() - 7);
    else if (period === 'month') start.setMonth(now.getMonth() - 1);
    else start.setFullYear(now.getFullYear() - 1);

    const periodTransactions = transactions.filter(t => new Date(t.date) >= start);
    let income = 0, expenses = 0;
    periodTransactions.forEach(t => t.type === 'income' ? income += t.amount : expenses += t.amount);
    return { income, expenses, balance: income - expenses };
  };

  const getRecentTransactions = () => [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const stats = calculateStats();
  const recent = getRecentTransactions();

  const getCategory = (id) => categories.find(c => c.id === id) || { name: 'Другое', icon: '📦', color: '#607D8B' };

  const getCategoryName = (cat) => {
    const map = {
      'Продукты': 'groceries', 'Транспорт': 'transport', 'Развлечения': 'entertainment',
      'Рестораны': 'restaurants', 'Покупки': 'shopping', 'Здоровье': 'health',
      'Образование': 'education', 'Другое': 'other', 'Зарплата': 'salary',
      'Подарки': 'gifts', 'Инвестиции': 'investments'
    };
    return t(map[cat.name] || 'other');
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.periodSelector}>
        {['week', 'month', 'year'].map(p => (
          <TouchableOpacity key={p} style={[styles.periodButton, period === p && styles.activePeriod]} onPress={() => setPeriod(p)}>
            <Text style={[styles.periodText, period === p && styles.activePeriodText]}>{t(p)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>{t('currentBalance')}</Text>
        <Text style={[styles.balanceAmount, { color: stats.balance >= 0 ? '#2E7D32' : '#C62828' }]}>
          {stats.balance.toLocaleString()} ₽
        </Text>
        <View style={styles.incomeExpenseRow}>
          <View style={styles.incomeBox}><Text style={styles.incomeLabel}>{t('income')}</Text><Text style={styles.incomeAmount}>+{stats.income.toLocaleString()} ₽</Text></View>
          <View style={styles.expenseBox}><Text style={styles.expenseLabel}>{t('expenses')}</Text><Text style={styles.expenseAmount}>-{stats.expenses.toLocaleString()} ₽</Text></View>
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Add', { type: 'expense' })}>
          <Icon name="remove-circle" size={24} color="#C62828" /><Text style={styles.actionText}>{t('expense')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Add', { type: 'income' })}>
          <Icon name="add-circle" size={24} color="#2E7D32" /><Text style={styles.actionText}>{t('income_capital')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Statistics')}>
          <Icon name="bar-chart" size={24} color="#1976D2" /><Text style={styles.actionText}>{t('statistics')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{t('recentTransactions')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}><Text style={styles.seeAll}>{t('viewAll')}</Text></TouchableOpacity>
        </View>
        {recent.length > 0 ? recent.map(item => {
          const cat = getCategory(item.categoryId);
          return (
            <View key={item.id} style={styles.transactionItem}>
              <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}><Text style={styles.categoryIconText}>{cat.icon}</Text></View>
              <View style={styles.transactionInfo}><Text style={styles.transactionCategory}>{getCategoryName(cat)}</Text><Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text></View>
              <Text style={[styles.transactionAmount, { color: item.type === 'income' ? '#2E7D32' : '#C62828' }]}>{item.type === 'income' ? '+' : '-'}{item.amount} ₽</Text>
            </View>
          );
        }) : (
          <View style={styles.emptyState}><Icon name="receipt" size={48} color="#ccc" /><Text style={styles.emptyStateText}>{t('noTransactions')}</Text><Text style={styles.emptyStateSubtext}>{t('addFirstTransaction')}</Text></View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  periodSelector: { flexDirection: 'row', justifyContent: 'center', padding: 15, backgroundColor: '#fff', marginBottom: 10 },
  periodButton: { paddingHorizontal: 20, paddingVertical: 8, marginHorizontal: 5, borderRadius: 20, backgroundColor: '#f0f0f0' },
  activePeriod: { backgroundColor: '#2E7D32' },
  periodText: { color: '#666', fontWeight: '500' },
  activePeriodText: { color: '#fff' },
  balanceCard: { backgroundColor: '#fff', padding: 20, marginHorizontal: 15, marginBottom: 15, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  balanceLabel: { fontSize: 14, color: '#666', marginBottom: 5 },
  balanceAmount: { fontSize: 32, fontWeight: 'bold', marginBottom: 15 },
  incomeExpenseRow: { flexDirection: 'row', justifyContent: 'space-between' },
  incomeBox: { flex: 1, marginRight: 10 }, expenseBox: { flex: 1, marginLeft: 10 },
  incomeLabel: { fontSize: 12, color: '#666' }, expenseLabel: { fontSize: 12, color: '#666' },
  incomeAmount: { fontSize: 16, color: '#2E7D32', fontWeight: '600' },
  expenseAmount: { fontSize: 16, color: '#C62828', fontWeight: '600' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', paddingVertical: 15, marginHorizontal: 15, marginBottom: 15, borderRadius: 15 },
  actionButton: { alignItems: 'center' },
  actionText: { marginTop: 5, fontSize: 12, color: '#666' },
  section: { backgroundColor: '#fff', padding: 15, marginHorizontal: 15, marginBottom: 15, borderRadius: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  seeAll: { color: '#2E7D32', fontSize: 14 },
  transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  categoryIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  categoryIconText: { fontSize: 20 },
  transactionInfo: { flex: 1 },
  transactionCategory: { fontSize: 16, fontWeight: '500' },
  transactionDate: { fontSize: 12, color: '#999', marginTop: 2 },
  transactionAmount: { fontSize: 16, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 30 },
  emptyStateText: { fontSize: 16, color: '#999', marginTop: 10 },
  emptyStateSubtext: { fontSize: 14, color: '#ccc', marginTop: 5 },
});

export default HomeScreen;
