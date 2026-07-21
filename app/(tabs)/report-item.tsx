import { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

export default function ReportItemScreen() {
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.card, isDesktop && styles.cardDesktop]}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lost &amp; Found</Text>
          <TouchableOpacity style={styles.cancelButton}>
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

          {/* Section Subtitle */}
          <View>
            <Text style={styles.sectionTitle}>
              {reportType === 'lost' ? 'Report Lost Item' : 'Report Found Item'}
            </Text>
            <Text style={styles.sectionSubtext}>
              Fill in the details below to help others identify your item
            </Text>
          </View>

          {/* Item Name & Date (Side by side on Desktop with aligned tops) */}
          <View style={isDesktop ? styles.row : styles.column}>
            <View style={[styles.fieldGroup, isDesktop && styles.flex1]}>
              <Text style={styles.label}>Item Name</Text>
              <Text style={styles.sectionSubtext}>What item are you reporting?</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., MacBook Pro, Black Nike backpack"
                placeholderTextColor="#9ca3af"
                value={itemName}
                onChangeText={setItemName}
              />
            </View>

            <View style={[styles.fieldGroup, isDesktop && styles.flex1]}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.sectionSubtext}>When was it lost or found?</Text>
              {Platform.OS === 'web' ? (
                /* HTML Date Picker for Web */
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
            <Text style={styles.label}>Description</Text>
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
            <Text style={styles.label}>Location</Text>
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
            <View style={[styles.fieldGroup, isDesktop && styles.flex1]}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={[styles.fieldGroup, isDesktop && styles.flex1]}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="your.email@wsc.edu"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Photo Upload Box */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Item Photo (optional)</Text>
            <Text style={styles.sectionSubtext}>
              A photo helps others identify your item more easily
            </Text>

            <TouchableOpacity style={styles.uploadBox}>
              <Text style={styles.uploadTitle}>Tap to select photo</Text>
              <Text style={styles.uploadSubtitle}>JPG, PNG, or HEIC</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitBtn}>
            <Text style={styles.submitBtnText}>Submit Report</Text>
          </TouchableOpacity>

        </View>
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
  submitBtn: {
    backgroundColor: '#030712',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});