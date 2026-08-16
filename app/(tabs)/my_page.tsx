import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

interface Item {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: 'lost' | 'found';
  image_url: string | null;
  status?: string;
  email: string;
  user_id?: string;
}

interface ModalConfig {
  visible: boolean;
  title: string;
  message: string;
  itemIdToDelete: string | null;
}

export default function MyPageScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Custom Modal State
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    visible: false,
    title: '',
    message: '',
    itemIdToDelete: null,
  });

  useEffect(() => {
    fetchUserDataAndSubmissions();
  }, []);

  const fetchUserDataAndSubmissions = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setUserEmail('Not logged in');
        setSubmissions([]);
        return;
      }

      setUserEmail(user.email || 'student@wsc.edu');

      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err: any) {
      console.error('Error loading profile page:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleSwitchAccount = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  // Perform actual deletion
  const handleDeleteItem = async (itemId: string) => {
    try {
      setSubmissions((prevItems) => prevItems.filter((item) => item.id !== itemId));

      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error deleting item:', err.message);
      fetchUserDataAndSubmissions();
    }
  };

  // Trigger modal when user clicks "Mark Found" or "Returned"
  const handleMarkStatus = (itemId: string, actionType: 'found' | 'returned') => {
    const title = actionType === 'found' ? 'Mark as Found' : 'Mark as Returned';
    const message = actionType === 'found'
      ? 'Are you sure this item was found? This will remove the listing.'
      : 'Are you sure this item was returned? This will remove the listing.';

    setModalConfig({
      visible: true,
      title,
      message,
      itemIdToDelete: itemId,
    });
  };

  // Trigger modal when user clicks the Trash icon
  const confirmDelete = (itemId: string) => {
    setModalConfig({
      visible: true,
      title: 'Delete Submission',
      message: 'Are you sure you want to delete this reported item? This action cannot be undone.',
      itemIdToDelete: itemId,
    });
  };

  // Modal Confirm Action
  const handleModalConfirm = () => {
    if (modalConfig.itemIdToDelete) {
      handleDeleteItem(modalConfig.itemIdToDelete);
    }
    setModalConfig((prev) => ({ ...prev, visible: false }));
  };

  // Modal Cancel Action
  const handleModalCancel = () => {
    setModalConfig((prev) => ({ ...prev, visible: false }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.card, isDesktop && styles.cardDesktop]}>
        
        {/* User Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <Text style={styles.loggedLabel}>Logged in as</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.btnText}>Log out</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchBtn} onPress={handleSwitchAccount}>
            <Text style={styles.btnText}>Switch account</Text>
          </TouchableOpacity>
        </View>

        {/* Submissions Section Header */}
        <View style={styles.submissionsHeader}>
          <Text style={styles.sectionTitle}>My Submissions</Text>
          <View style={styles.badgeCount}>
            <Text style={styles.badgeText}>{submissions.length} items</Text>
          </View>
        </View>

        {/* Submissions List / Empty State */}
        {loading ? (
          <ActivityIndicator size="large" color="#000000" style={{ marginVertical: 30 }} />
        ) : submissions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No submissions yet</Text>
            <Text style={styles.emptySubtext}>Items you report will appear here</Text>
          </View>
        ) : (
          <View style={styles.itemsList}>
            {submissions.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                {item.image_url && (
                  <Image source={{ uri: item.image_url }} style={styles.itemImage} />
                )}
                
                <View style={styles.itemContent}>
                  <View style={styles.itemHeaderRow}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <View
                      style={[
                        styles.typeBadge,
                        item.type === 'lost' ? styles.lostBadge : styles.foundBadge,
                      ]}
                    >
                      <Text style={styles.typeBadgeText}>
                        {item.type === 'lost' ? 'Lost' : 'Found'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>📍 {item.location}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>📅 {item.date}</Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.cardActions}>
                    {item.type === 'lost' ? (
                      <TouchableOpacity
                        style={styles.markFoundBtn}
                        onPress={() => handleMarkStatus(item.id, 'found')}
                      >
                        <Text style={styles.markFoundText}>✓ Mark Found</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.returnedBtn}
                        onPress={() => handleMarkStatus(item.id, 'returned')}
                      >
                        <Text style={styles.returnedText}>🔄 Returned</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => confirmDelete(item.id)}
                    >
                      <Text style={styles.deleteText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

      </View>

      {/* CUSTOM POPUP MODAL */}
      <Modal
        visible={modalConfig.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleModalCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalMessage}>{modalConfig.message}</Text>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleModalConfirm}>
                <Text style={styles.modalConfirmText}>Confirm & Remove</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={handleModalCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardDesktop: {
    maxWidth: 600,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarIcon: {
    fontSize: 32,
  },
  loggedLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  actionRow: {
    gap: 10,
    marginBottom: 24,
  },
  logoutBtn: {
    backgroundColor: '#e11d48',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  switchBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  submissionsHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  badgeCount: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  emptyContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  itemsList: {
    gap: 16,
  },
  itemCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  itemImage: {
    width: '100%',
    height: 160,
  },
  itemContent: {
    padding: 14,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lostBadge: {
    backgroundColor: '#be123c',
  },
  foundBadge: {
    backgroundColor: '#000000',
  },
  typeBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  itemDescription: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 10,
  },
  metaRow: {
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  markFoundBtn: {
    flex: 2,
    backgroundColor: '#16a34a',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  markFoundText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  returnedBtn: {
    flex: 2,
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  returnedText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 14,
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  warningIcon: {
    fontSize: 42,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalButtonContainer: {
    width: '100%',
    gap: 8,
  },
  modalConfirmBtn: {
    width: '100%',
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalCancelBtn: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '600',
  },
});