import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../context/LanguageContext';
import { getCategories, addTransaction } from '../database/database';

const AddTransactionScreen = ({ navigation, route }) => {
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [type, setType] = useState(route.params?.type || 'expense');

  useEffect(() => { loadCategories(); }, [type]);

  const loadCategories = async () => {
    const cats = await getCategories(type);
    setCategories(cats);
    if (cats.length && !selectedCategory) setSelectedCategory(cats[0]);
  };

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert(t('error'), t('enterValidAmount'));
      return;
    }
    if (!selectedCategory) {
      Alert.alert(t('error'), t('selectCategory_error'));
      return;
    }
    try {
      await addTransaction({ amount: parseFloat(amount), description: description.trim() || t('other'), categoryId: selectedCategory.id, type });
      Alert.alert(t('success'), t('transactionAdded'), [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert(t('error'), t('saveError'));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.typeSelector}>
        <TouchableOpacity style={[styles.typeButton, type === 'expense' && styles.activeExpense]} onPress={() => setType('expense')}>
          <Icon name="remove-circle" size={24} color={type === 'expense' ? '#fff' : '#C62828'} />
          <Text style={[styles.typeText, type === 'expense' && styles.activeTypeText]}>{t('expense')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.typeButton, type === 'income' && styles.activeIncome]} onPress={() => setType('income')}>
          <Icon name="add-circle" size={24} color={type === 'income' ? '#fff' : '#2E7D32'} />
          <Text style={[styles.typeText, type === 'income' && styles.activeTypeText]}>{t('income_capital')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>{t('amount')}</Text>
        <View style={styles.amountInputContainer}>
          <TextInput style={styles.amountInput} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0" autoFocus />
          <Text style={styles.currency}>₽</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t('description')}</Text>
        <TextInput style={styles.descriptionInput} value={description} onChangeText={setDescription} placeholder={t('descriptionPlaceholder')} multiline />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t('category')}</Text>
        <View style={styles.categoriesGrid}>
          {categories.map(cat => (
            <TouchableOpacity key={cat.id} style={[styles.categoryItem, selectedCategory?.id === cat.id && { backgroundColor: cat.color + '20', borderColor: cat.color }]} onPress={() => setSelectedCategory(cat)}>
              <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}><Text style={styles.categoryIconText}>{cat.icon}</Text></View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}><Text style={styles.saveButtonText}>{t('save')}</Text></TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  typeSelector: { flexDirection: 'row', padding: 15 },
  typeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, marginHorizontal: 5, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  activeExpense: { backgroundColor: '#C62828', borderColor: '#C62828' },
  activeIncome: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  typeText: { marginLeft: 8, fontSize: 16, fontWeight: '500' },
  activeTypeText: { color: '#fff' },
  amountCard: { backgroundColor: '#fff', padding: 20, marginHorizontal: 15, marginBottom: 15, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  amountLabel: { fontSize: 14, color: '#666', marginBottom: 10 },
  amountInputContainer: { flexDirection: 'row', alignItems: 'center' },
  amountInput: { flex: 1, fontSize: 36, fontWeight: 'bold', padding: 0 },
  currency: { fontSize: 24, color: '#666', marginLeft: 10 },
  card: { backgroundColor: '#fff', padding: 15, marginHorizontal: 15, marginBottom: 15, borderRadius: 15 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  descriptionInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16, minHeight: 60, textAlignVertical: 'top' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  categoryItem: { width: '33.33%', alignItems: 'center', padding: 10, borderWidth: 2, borderColor: 'transparent', borderRadius: 10 },
  categoryIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  categoryIconText: { fontSize: 24 },
  categoryName: { fontSize: 12, textAlign: 'center' },
  saveButton: { backgroundColor: '#2E7D32', margin: 15, padding: 15, borderRadius: 10, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});

export default AddTransactionScreen;
