import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../context/LanguageContext';
import { getTransactions, deleteTransaction, getCategories } from '../database/database';

const TransactionsScreen = () => {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    const [trans, cats] = await Promise.all([getTransactions(), getCategories()]);
    setTransactions(trans.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setCategories(cats);
  };

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const handleDelete = (id) => {
    Alert.alert(t('deleteConfirm'), '', [{ text: t('cancel'), style: 'cancel' }, { text: t('delete'), onPress: async () => { await deleteTransaction(id); loadData(); } }]);
  };

  const getCategory = (id) => categories.find(c => c.id === id) || { name: t('other'), icon: '📦', color: '#607D8B' };

  const renderItem = ({ item }) => {
    const cat = getCategory(item.categoryId);
    return (
      <View style={styles.item}>
        <View style={[styles.iconContainer, { backgroundColor: cat.color + '20' }]}><Text style={styles.icon}>{cat.icon}</Text></View>
        <View style={styles.info}>
          <Text style={styles.category}>{cat.name}</Text>
          <Text style={styles.desc}>{item.description}</Text>
          <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.amount, { color: item.type === 'income' ? '#2E7D32' : '#C62828' }]}>{item.type === 'income' ? '+' : '-'}{item.amount} ₽</Text>
          <TouchableOpacity onPress={() => handleDelete(item.id)}><Icon name="delete" size={22} color="#999" /></TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <FlatList data={transactions} keyExtractor={item => item.id
