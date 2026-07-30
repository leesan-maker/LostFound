import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

// Local placeholder image for items reported without a photo
const placeholderImage = require('../../assets/images/no-image.png');

interface Item {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  date: string;
  location: string;
  phone?: string;
  email?: string;
  image_url?: string | null;
  created_at?: string;
}

export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');

  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  // Fetch items from Supabase
  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setItems(data as Item[]);
    } catch (err: any) {
      console.error('Error fetching items:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'lost') return item.type === 'lost';
    if (filter === 'found') return item.type === 'found';
    return true;
  });

  const totalCount = items.length;
  const lostCount = items.filter((i) => i.type === 'lost').length;
  const foundCount = items.filter((i) => i.type === 'found').length;

  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      alert('No phone number provided for this report.');
    }
  };

  const handleEmail = (email?: string) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    } else {
      alert('No email address provided for this report.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={[styles.mainWrapper, isDesktop && styles.mainWrapperDesktop]}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📦 Lost &amp; Found</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{lostCount}</Text>
            <Text style={styles.statLabel}>Lost</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{foundCount}</Text>
            <Text style={styles.statLabel}>Found</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'lost' && styles.filterTabActive]}
            onPress={() => setFilter('lost')}
          >
            <Text style={[styles.filterTabText, filter === 'lost' && styles.filterTabTextActive]}>
              Lost
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'found' && styles.filterTabActive]}
            onPress={() => setFilter('found')}
          >
            <Text style={[styles.filterTabText, filter === 'found' && styles.filterTabTextActive]}>
              Found
            </Text>
          </TouchableOpacity>
        </View>

        {/* Item Count */}
        <View style={styles.itemCountRow}>
          <Text style={styles.itemCountText}>
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {/* Cards Feed */}
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#111827" />
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No items reported yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Be the first to post a lost or found item!
            </Text>
          </View>
        ) : (
          <View style={styles.cardsList}>
            {filteredItems.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                
                {/* Image Display */}
                <Image
                  source={
                    item.image_url
                      ? { uri: item.image_url }
                      : placeholderImage
                  }
                  style={styles.cardImage}
                  resizeMode={item.image_url ? 'cover' : 'contain'}
                />

                <View style={styles.cardBody}>
                  {/* Title & Badge */}
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View
                      style={[
                        styles.badge,
                        item.type === 'lost' ? styles.badgeLost : styles.badgeFound,
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {item.type === 'lost' ? 'Lost' : 'Found'}
                      </Text>
                    </View>
                  </View>

                  {/* Description */}
                  {!!item.description && (
                    <Text style={styles.cardDescription}>{item.description}</Text>
                  )}

                  {/* Details */}
                  <View style={styles.detailsGroup}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>📍</Text>
                      <Text style={styles.detailText}>{item.location}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>📅</Text>
                      <Text style={styles.detailText}>{item.date}</Text>
                    </View>
                  </View>

                  {/* Contact Buttons */}
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      style={styles.callBtn}
                      onPress={() => handleCall(item.phone)}
                    >
                      <Text style={styles.callBtnText}>📞 Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.emailBtn}
                      onPress={() => handleEmail(item.email)}
                    >
                      <Text style={styles.emailBtnText}>✉️ Email</Text>
                    </TouchableOpacity>
                  </View>

                </View>
              </View>
            ))}
          </View>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  mainWrapper: {
    width: '100%',
    maxWidth: 500,
    gap: 16,
  },
  mainWrapperDesktop: {
    maxWidth: 720,
  },
  header: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#ffffff',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  filterTabTextActive: {
    color: '#111827',
  },
  itemCountRow: {
    paddingHorizontal: 4,
  },
  itemCountText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardsList: {
    gap: 20,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#f8fafc',
  },
  cardBody: {
    padding: 18,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  badgeLost: {
    backgroundColor: '#dc2626',
  },
  badgeFound: {
    backgroundColor: '#030712',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  detailsGroup: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailIcon: {
    fontSize: 14,
  },
  detailText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  actionButtonsRow: {
    gap: 8,
    marginTop: 4,
  },
  callBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  callBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  emailBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  emailBtnText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
});