import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
// Use the legacy import path to fix SDK deprecation warnings/errors
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

export default function ReportItemScreen() {
  const router = useRouter();

  // Permission Hooks
  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();

  // Form State
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal Popups State
  const [validationModalVisible, setValidationModalVisible] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  // Pre-fill active account email on load
  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
    };
    fetchUserEmail();
  }, []);

  // Reset form inputs back to default
  const resetForm = async () => {
    setReportType('lost');
    setItemName('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setLocation('');
    setPhone('');
    setImageUri(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      setEmail(user.email);
    }
  };

  // Handle Photo Picker
  const handleTakePhoto = async () => {
    let hasPermission = cameraPermission?.granted;
    if (!hasPermission) {
      const permissionResult = await requestCameraPermission();
      hasPermission = permissionResult.granted;
    }

    if (!hasPermission) {
      alert('Camera access is required to take a photo of the item.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleChooseFromLibrary = async () => {
    let hasPermission = mediaLibraryPermission?.granted;
    if (!hasPermission) {
      const permissionResult = await requestMediaLibraryPermission();
      hasPermission = permissionResult.granted;
    }

    if (!hasPermission) {
      alert('Photo library access is required to choose an existing image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePickImage = () => {
    if (Platform.OS === 'web') {
      const choice = window.confirm(
        'Click "OK" to take a photo with your camera, or "Cancel" to choose from your gallery.'
      );
      if (choice) handleTakePhoto();
      else handleChooseFromLibrary();
    } else {
      Alert.alert(
        'Add Item Photo',
        'Would you like to take a new photo with your camera or select one from your library?',
        [
          { text: '📷 Take Photo', onPress: handleTakePhoto },
          { text: '🖼️ Choose from Library', onPress: handleChooseFromLibrary },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  // Image Upload Handler
  const uploadImageToSupabase = async (uri: string): Promise<string> => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const fileExt = uri.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const contentType = fileExt === 'png' ? 'image/png' : 'image/jpeg';

    const arrayBuffer = decode(base64);

    const { error: uploadError } = await supabase.storage
      .from('item-photos')
      .upload(fileName, arrayBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('item-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // Submit Handler with Strict Validations
  const handleSubmit = async () => {
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();

    // 1. Check Empty Fields
    if (
      !itemName.trim() ||
      !description.trim() ||
      !date.trim() ||
      !location.trim() ||
      !cleanPhone ||
      !cleanEmail
    ) {
      setValidationMessage('Please fill in all required fields before submitting.');
      setValidationModalVisible(true);
      return;
    }

    // 2. Strict Phone Validation (Numbers only, minimum 7 digits)
    if (cleanPhone.length < 7) {
      setValidationMessage('Please enter a valid phone number (at least 7 digits).');
      setValidationModalVisible(true);
      return;
    }

    // 3. Strict Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setValidationMessage('Please enter a valid email address (e.g., name@domain.com).');
      setValidationModalVisible(true);
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('You must be logged in to submit a report.');
        setLoading(false);
        return;
      }

      let finalImageUrl: string | null = null;
      if (imageUri) {
        finalImageUrl = await uploadImageToSupabase(imageUri);
      }

      const { error } = await supabase.from('items').insert([
        {
          user_id: user.id,
          type: reportType,
          title: itemName,
          description,
          date,
          location,
          phone: cleanPhone,
          email: cleanEmail,
          image_url: finalImageUrl,
        },
      ]);

      if (error) throw error;

      setSuccessModalVisible(true);
    } catch (err: any) {
      alert('Submission Error: ' + (err.message || 'Something went wrong while submitting.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalVisible(false);
    resetForm();
    router.push('/(tabs)');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.card, isDesktop && styles.cardDesktop]}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lost &amp; Found</Text>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Form Body */}
        <View style={styles.formBody}>
          
          {/* Toggle Buttons */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                reportType === 'lost' && styles.toggleBtnActive,
              ]}
              onPress={() => setReportType('lost')}
            >
              <Text
                style={[
                  styles.toggleText,
                  reportType === 'lost' && styles.toggleTextActive,
                ]}
              >
                Lost
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleBtn,
                reportType === 'found' && styles.toggleBtnActive,
              ]}
              onPress={() => setReportType('found')}
            >
              <Text
                style={[
                  styles.toggleText,
                  reportType === 'found' && styles.toggleTextActive,
                ]}
              >
                Found
              </Text>
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <View>
            <Text style={styles.sectionTitle}>
              {reportType === 'lost' ? 'Report Lost Item' : 'Report Found Item'}
            </Text>
            <Text style={styles.sectionSubtext}>
              Fill in all details below to help others identify your item
            </Text>
          </View>

          {/* Item Name & Date */}
          <View style={isDesktop ? styles.row : styles.column}>
            <View style={[styles.fieldGroup, isDesktop && styles.flex1]}>
              <Text style={styles.label}>
                Item Name <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., MacBook Pro, Black Nike backpack"
                placeholderTextColor="#9ca3af"
                value={itemName}
                onChangeText={setItemName}
              />
            </View>

            <View style={[styles.fieldGroup, isDesktop && styles.flex1]}>
              <Text style={styles.label}>
                Date <Text style={styles.requiredStar}>*</Text>
              </Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: 10,
                    padding: '12px 14px',
                    fontSize: '14px',
                    color: '#111827',
                    border: '1px solid #e5e7eb',
                    outline: 'none',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    height: 45,
                    boxSizing: 'border-box',
                  } as any}
                />
              ) : (
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9ca3af"
                />
              )}
            </View>
          </View>

          {/* Description */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Description <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe color, brand, distinguishing features..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Location */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Location <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Library 2nd Floor, Computer Lab B"
              placeholderTextColor="#9ca3af"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View style={styles.divider} />

          {/* Contact Information */}
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={isDesktop ? styles.row : styles.column}>
            {/* Phone Input: Rejects non-numeric characters on change */}
            <View style={[styles.fieldGroup, isDesktop && styles.flex1]}>
              <Text style={styles.label}>
                Phone Number <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="5551234567"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
              />
            </View>

            {/* Email Input */}
            <View style={[styles.fieldGroup, isDesktop && styles.flex1]}>
              <Text style={styles.label}>
                Email Address <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="your.email@domain.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Photo Upload Box */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Item Photo (optional)</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage}>
              {imageUri ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  <Text style={styles.uploadTitle}>Tap to change photo</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.uploadTitle}>📷 Tap to take or select photo</Text>
                  <Text style={styles.uploadSubtitle}>JPG, PNG, or HEIC</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.disabledBtn]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Report</Text>
            )}
          </TouchableOpacity>

        </View>
      </View>

      {/* Validation Warning Modal */}
      <Modal
        visible={validationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setValidationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalIcon}>⚠️</Text>
            <Text style={styles.modalTitle}>Invalid Input</Text>
            <Text style={styles.modalMessage}>{validationMessage}</Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setValidationModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalIcon}>🎉</Text>
            <Text style={styles.modalTitle}>Report Submitted!</Text>
            <Text style={styles.modalMessage}>
              Your item report has been successfully recorded and published.
            </Text>
            <TouchableOpacity style={styles.modalBtnSuccess} onPress={handleSuccessClose}>
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
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
    maxWidth: 500,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  cardDesktop: {
    maxWidth: 720,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  cancelButton: {
    backgroundColor: '#030712',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  formBody: {
    padding: 20,
    gap: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  toggleBtnActive: {
    borderWidth: 2,
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  toggleTextActive: {
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSubtext: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  column: {
    flexDirection: 'column',
    gap: 16,
  },
  flex1: {
    flex: 1,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  requiredStar: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 45,
  },
  textArea: {
    minHeight: 80,
    height: 'auto',
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 4,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    gap: 4,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  previewContainer: {
    alignItems: 'center',
    gap: 8,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  submitBtn: {
    backgroundColor: '#030712',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalIcon: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalMessage: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  modalBtnSuccess: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  modalBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
});