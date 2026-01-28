import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/reduxStore/store/store';
import { getWalletBalance, getReferralStats, logout } from '../../app/reduxStore/reduxSlices/authSlice';
// import * as Clipboard from 'expo-clipboard';
// import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

export default function Wallet() {
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('balance');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (auth.isAuthenticated) {
      try {
        await Promise.all([
          dispatch(getWalletBalance()),
          dispatch(getReferralStats())
        ]);
      } catch (error) {
        console.error('Error loading wallet data:', error);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const copyReferralCode = async () => {
    const referralCode = auth.referralData?.referralCode;
    if (referralCode) {
      await Clipboard.setStringAsync(referralCode);
      Alert.alert('Copied!', `Referral code ${referralCode} copied to clipboard`);
    }
  };

  const shareReferral = async () => {
    const referralCode = auth.referralData?.referralCode || 'FYNDOM';
    const message = `Join Fyndom - Find the best hostels and PGs!\n\nUse my referral code: ${referralCode}\n\nWe both get ₹250 when you book! 🎉\n\nDownload: https://fyndom.app`;
    
    try {
      await Sharing.shareAsync(message, {
        dialogTitle: 'Share Fyndom Referral',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderBalanceCard = () => (
    <View style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <Ionicons name="wallet-outline" size={30} color="#fff" />
        <Text style={styles.balanceTitle}>Wallet Balance</Text>
      </View>
      
      <View style={styles.balanceAmountContainer}>
        <Text style={styles.balanceAmount}>
          ₹{auth.walletData?.balance?.toLocaleString('en-IN') || '0'}
        </Text>
        <Text style={styles.balanceSubtitle}>Available Balance</Text>
      </View>

      <View style={styles.balanceStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {auth.referralData?.referralCount || 0}
          </Text>
          <Text style={styles.statLabel}>Referrals</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ₹{(auth.referralData?.referralPoints || 0) * 250 || 0}
          </Text>
          <Text style={styles.statLabel}>Earned</Text>
        </View>
      </View>
    </View>
  );

  const renderReferralCard = () => (
    <View style={styles.referralCard}>
      <View style={styles.referralHeader}>
        <Ionicons name="gift-outline" size={24} color="#219150" />
        <Text style={styles.referralTitle}>Refer & Earn ₹250</Text>
      </View>
      
      <Text style={styles.referralCodeLabel}>Your Referral Code:</Text>
      <TouchableOpacity 
        style={styles.referralCodeContainer}
        onPress={copyReferralCode}
      >
        <Text style={styles.referralCode}>
          {auth.referralData?.referralCode || 'N/A'}
        </Text>
        <Ionicons name="copy-outline" size={20} color="#219150" />
      </TouchableOpacity>

      <Text style={styles.referralInfo}>
        Share your code with friends. When they sign up and book, you both get ₹250!
      </Text>

      <TouchableOpacity 
        style={styles.shareButton}
        onPress={shareReferral}
      >
        <Ionicons name="share-social-outline" size={20} color="#fff" />
        <Text style={styles.shareButtonText}>Share Referral</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTransactions = () => {
    const transactions = auth.walletData?.transactions || [];

    if (transactions.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={50} color="#ccc" />
          <Text style={styles.emptyStateText}>No transactions yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Your transaction history will appear here
          </Text>
        </View>
      );
    }

    return transactions.map((transaction: any) => (
      <View key={transaction._id} style={styles.transactionCard}>
        <View style={[
          styles.transactionIcon,
          { backgroundColor: transaction.type === 'credit' ? '#e8f5e9' : '#ffebee' }
        ]}>
          <Ionicons 
            name={transaction.type === 'credit' ? 'arrow-down' : 'arrow-up'} 
            size={20} 
            color={transaction.type === 'credit' ? '#4CAF50' : '#F44336'} 
          />
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription}>
            {transaction.description}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDate(transaction.createdAt)}
          </Text>
        </View>
        
        <Text style={[
          styles.transactionAmount,
          transaction.type === 'credit' ? styles.creditText : styles.debitText
        ]}>
          {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
        </Text>
      </View>
    ));
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#219150" />
      <Text style={styles.loadingText}>Loading wallet...</Text>
    </View>
  );

  if (!auth.isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notLoggedIn}>
          <Ionicons name="wallet-outline" size={60} color="#ccc" />
          <Text style={styles.notLoggedInText}>Please login to view wallet</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (auth.loading && !auth.walletData) {
    return renderLoading();
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderBalanceCard()}
        
        {renderReferralCard()}

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
            onPress={() => setActiveTab('transactions')}
          >
            <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>
              Transactions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'howitworks' && styles.activeTab]}
            onPress={() => setActiveTab('howitworks')}
          >
            <Text style={[styles.tabText, activeTab === 'howitworks' && styles.activeTabText]}>
              How It Works
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'transactions' && (
          <View style={styles.transactionsContainer}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {renderTransactions()}
          </View>
        )}

        {activeTab === 'howitworks' && (
          <View style={styles.howItWorks}>
            <Text style={styles.sectionTitle}>How Referral Works</Text>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Share Your Code</Text>
                <Text style={styles.stepDescription}>
                  Share your referral code with friends via WhatsApp, Instagram, etc.
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Friend Registers</Text>
                <Text style={styles.stepDescription}>
                  Friend signs up on Fyndom using your referral code
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>First Booking</Text>
                <Text style={styles.stepDescription}>
                  Friend completes their first hostel/PG booking
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>You Get Rewarded</Text>
                <Text style={styles.stepDescription}>
                  ₹250 is credited to your wallet instantly!
                </Text>
              </View>
            </View>

            <View style={styles.termsCard}>
              <Text style={styles.termsTitle}>Terms & Conditions</Text>
              <Text style={styles.termsText}>
                • Reward credited only after friend's first booking{'\n'}
                • Maximum ₹5000 earnings per month{'\n'}
                • Wallet balance can be used for future bookings{'\n'}
                • No cash withdrawal option{'\n'}
                • Terms may change without notice
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  balanceCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#219150',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 10,
  },
  balanceAmountContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
  },
  balanceSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  referralCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#219150',
    marginLeft: 10,
  },
  referralCodeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1f8e9',
    borderWidth: 2,
    borderColor: '#219150',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  referralCode: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#219150',
    letterSpacing: 2,
  },
  referralInfo: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: '#219150',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#219150',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  transactionsContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222831',
    marginBottom: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222831',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  creditText: {
    color: '#4CAF50',
  },
  debitText: {
    color: '#F44336',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  howItWorks: {
    paddingHorizontal: 16,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#219150',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222831',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222831',
    marginBottom: 12,
  },
  termsText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#219150',
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notLoggedInText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#219150',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});