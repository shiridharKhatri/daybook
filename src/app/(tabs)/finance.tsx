import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { haptic } from '../../utils/haptics';
import {
  Card,
  Button,
  Input,
  BottomSheet,
  Badge,
  EmptyState,
} from '../../components/common';
import { PlusIcon, TrashIcon } from '../../components/icons';
import {
  financeRepository,
  TransactionItem,
  FinanceSummary,
} from '../../database/repositories';
import { format } from 'date-fns';

const CATEGORIES = [
  'Food & Dining',
  'Beauty & Haircare',
  'Shopping',
  'Healthcare',
  'Transportation',
  'Bills & Utilities',
  'Personal',
  'Income / Salary',
];

export default function FinanceScreen() {
  const [summary, setSummary] = useState<FinanceSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    spendingToday: 0,
    categoryBreakdown: [],
  });
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  // Add transaction sheet
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Beauty & Haircare');
  const [description, setDescription] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    setSummary(financeRepository.getSummary());
    setTransactions(financeRepository.getAll({ limit: 25 }));
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 300);
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleAddTransaction = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    haptic.success();
    financeRepository.create({
      type,
      amount: val,
      category,
      description: description.trim() || category,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash / Card',
    });

    setAmount('');
    setDescription('');
    setShowAddSheet(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    haptic.medium();
    financeRepository.delete(id);
    loadData();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finance</Text>
        <Pressable
          onPress={() => setShowAddSheet(true)}
          style={styles.addButton}
        >
          <PlusIcon size={16} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Entry</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C58882"
          />
        }
      >
        {/* Main Balance Card */}
        <View style={styles.balanceSection}>
          <Card style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              NPR {summary.balance.toLocaleString()}
            </Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.incomeLabel}>↓ Income</Text>
                <Text style={styles.incomeValue}>
                  +NPR {summary.totalIncome.toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.expenseLabel}>↑ Expenses</Text>
                <Text style={styles.expenseValue}>
                  -NPR {summary.totalExpenses.toLocaleString()}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Category Breakdown */}
        {summary.categoryBreakdown.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spending by Category</Text>
            <Card style={styles.breakdownCard}>
              {summary.categoryBreakdown.map((cat) => (
                <View key={cat.category} style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{cat.category}</Text>
                    <Text style={styles.categoryAmount}>
                      NPR {cat.amount.toLocaleString()} ({cat.percentage}%)
                    </Text>
                  </View>
                  {/* Subtle progress bar */}
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${Math.min(cat.percentage, 100)}%` },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Transactions List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <Card key={tx.id} style={styles.txCard}>
                <View style={styles.txRow}>
                  <View style={styles.txInfo}>
                    <Text style={styles.txDesc}>{tx.description}</Text>
                    <View style={styles.txMeta}>
                      <Badge label={tx.category} size="small" />
                      <Text style={styles.txDate}>{tx.date}</Text>
                    </View>
                  </View>

                  <View style={styles.txRight}>
                    <Text
                      style={[
                        styles.txAmount,
                        tx.type === 'income' ? styles.txIncome : styles.txExpense,
                      ]}
                    >
                      {tx.type === 'income' ? '+' : '-'}NPR {tx.amount}
                    </Text>
                    <Pressable
                      onPress={() => handleDelete(tx.id)}
                      hitSlop={8}
                      style={styles.deleteBtn}
                    >
                      <TrashIcon size={14} color="#B5AFA8" />
                    </Pressable>
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <EmptyState
              title="No transactions yet"
              description="Track your self-care, shopping, and everyday spending in one peaceful place."
              actionLabel="Add Transaction"
              onAction={() => setShowAddSheet(true)}
            />
          )}
        </View>
      </ScrollView>

      {/* Add Transaction Bottom Sheet */}
      <BottomSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        title="Add Transaction"
      >
        <View style={styles.sheetContent}>
          {/* Income vs Expense switch */}
          <View style={styles.typeSwitch}>
            <Pressable
              onPress={() => setType('expense')}
              style={[
                styles.typeSwitchTab,
                type === 'expense' && styles.activeExpenseTab,
              ]}
            >
              <Text
                style={[
                  styles.typeSwitchText,
                  type === 'expense' && styles.activeSwitchText,
                ]}
              >
                Expense
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setType('income')}
              style={[
                styles.typeSwitchTab,
                type === 'income' && styles.activeIncomeTab,
              ]}
            >
              <Text
                style={[
                  styles.typeSwitchText,
                  type === 'income' && styles.activeSwitchText,
                ]}
              >
                Income
              </Text>
            </Pressable>
          </View>

          <Input
            label="Amount (NPR)"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <Input
            label="Description"
            placeholder="e.g. Rosemary Scalp Oil"
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.categoryLabel}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryChips}
          >
            {CATEGORIES.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={[
                  styles.catChip,
                  category === c && styles.activeCatChip,
                ]}
              >
                <Text
                  style={[
                    styles.catChipText,
                    category === c && styles.activeCatChipText,
                  ]}
                >
                  {c}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Button
            title="Save Transaction"
            onPress={handleAddTransaction}
            fullWidth
            size="medium"
            style={{ marginTop: 12 }}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#34312F',
    letterSpacing: -0.5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C58882',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  balanceSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  balanceCard: {
    padding: 20,
    backgroundColor: '#34312F',
    borderColor: '#34312F',
  },
  balanceLabel: {
    fontSize: 13,
    color: '#B5AFA8',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 8,
    letterSpacing: -0.8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#4A4643',
  },
  summaryItem: {
    flex: 1,
  },
  incomeLabel: {
    fontSize: 12,
    color: '#8DB580',
    fontWeight: '600',
  },
  incomeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  expenseLabel: {
    fontSize: 12,
    color: '#E8B36F',
    fontWeight: '600',
  },
  expenseValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#4A4643',
    marginHorizontal: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#34312F',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  breakdownCard: {
    padding: 16,
    gap: 14,
  },
  categoryRow: {
    width: '100%',
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34312F',
  },
  categoryAmount: {
    fontSize: 13,
    color: '#88827E',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F5ECE7',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#C58882',
    borderRadius: 3,
  },
  txCard: {
    marginBottom: 10,
    padding: 14,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  txInfo: {
    flex: 1,
  },
  txDesc: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34312F',
  },
  txMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  txDate: {
    fontSize: 12,
    color: '#88827E',
  },
  txRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  txIncome: {
    color: '#8DB580',
  },
  txExpense: {
    color: '#34312F',
  },
  deleteBtn: {
    padding: 4,
    marginTop: 4,
  },
  sheetContent: {
    paddingBottom: 32,
  },
  typeSwitch: {
    flexDirection: 'row',
    backgroundColor: '#FAF8F4',
    padding: 4,
    borderRadius: 14,
    marginBottom: 16,
  },
  typeSwitchTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeExpenseTab: {
    backgroundColor: '#C58882',
  },
  activeIncomeTab: {
    backgroundColor: '#8DB580',
  },
  typeSwitchText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#88827E',
  },
  activeSwitchText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#88827E',
    marginBottom: 8,
  },
  categoryChips: {
    gap: 8,
    paddingBottom: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEAE5',
  },
  activeCatChip: {
    backgroundColor: '#34312F',
    borderColor: '#34312F',
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#88827E',
  },
  activeCatChipText: {
    color: '#FFFFFF',
  },
});
