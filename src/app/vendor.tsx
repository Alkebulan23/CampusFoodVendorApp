import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabaseClient';

// Explicit TS data model definitions
export interface Order {
  id: string;
  items: string;
  total: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  student: string;
}

export interface VendorDetails {
  id: string;
  name: string;
  standName: string;
  contactPhone: string;
  workingHours: string;
  hasCompletedSetup: boolean; 
}

export interface UserProfile {
  user_id: number;          
  user_type: 'STUDENT' | 'VENDOR'; 
  full_name: string;        
  tut_email: string;        
  creation_time: string;    
}

export default function VendorDashboard() {
  const router = useRouter();

  // Dynamic state tracks vendor identity parameters
  const [vendor, setVendor] = useState<VendorDetails>({
    id: "",
    name: "", 
    standName: "", 
    contactPhone: "",
    workingHours: "",
    hasCompletedSetup: false 
  });

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'profile'>('profile');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>("TUT-8831");

  // Dynamic simulation queue list state hook mapping
  const [orders, setOrders] = useState<Order[]>([
    { id: "TUT-8831", items: "Kota (Russian, Chips & Cheese) + Sprite", total: "R48.00", status: 'pending', student: "Kabelo M." },
    { id: "TUT-8832", items: "Quarter Chicken with Savoury Rice", total: "R65.00", status: 'preparing', student: "Zanele Ndlovu" },
    { id: "TUT-8833", items: "Boerewors Roll & Chips Combo", total: "R40.00", status: 'ready', student: "Sipho Khumalo" }
  ]);

  React.useEffect(() => {
    const fetchExistingStorefrontMeta = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) return;

        const cleanEmail = user.email.toLowerCase().trim();

        // 1. Fetch user account metadata including full name
        const { data: appUser, error: appUserError } = await supabase
          .from('users')
          .select('user_id, full_name')
          .eq('tut_email', cleanEmail)
          .single<{ user_id: number; full_name: string }>(); 

        if (appUserError || !appUser) {
          console.warn("Central profile record connection signature missing.");
          return;
        }

        // 2. Fallback initialization profile state update
        setVendor(prev => ({ ...prev, name: appUser.full_name, id: String(appUser.user_id) }));

        // 3. Check for existing storefront setup parameters
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('user_id', appUser.user_id)
          .single();

        if (vendorData && !vendorError && vendorData.has_completed_setup) {
          setVendor({
            id: String(appUser.user_id),
            name: vendorData.vendor_name || appUser.full_name,
            standName: vendorData.stand_name,
            contactPhone: vendorData.contact_phone || "",
            workingHours: vendorData.working_hours || "",
            hasCompletedSetup: vendorData.has_completed_setup
          });
          setActiveTab('orders'); 
        }
      } catch (err) {
        console.error("Initialization sync hook error:", err);
      }
    };

    fetchExistingStorefrontMeta();
  }, []);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };
  
  const handleSaveSetup = async () => {
    // Fronted validation leaves out vendor name completely since DB defaults it to full name
    if (!vendor.standName.trim() || !vendor.contactPhone.trim() || !vendor.workingHours.trim()) {
      alert("MANDATORY FIELDS: Please fill in all configuration details to launch your storefront.");
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user || !user.email) {
        alert("SESSION EXPIRED: Please log out and sign back in to re-authenticate.");
        return;
      }

      const cleanEmail = user.email.toLowerCase().trim();

      const { data: appUser, error: appUserError } = await supabase
        .from('users')
        .select('user_id, full_name')
        .eq('tut_email', cleanEmail)
        .single<{ user_id: number; full_name: string }>(); 

      if (appUserError || !appUser) {
        alert("PROFILE NOT FOUND: Ensure your account mapping exists in the central database schema registry.");
        return;
      }

      // Upsert transaction automatically leverages the database function trigger
      const { error: dbError } = await supabase
        .from('vendors')
        .upsert({
          user_id: appUser.user_id,                  
          stand_name: vendor.standName.trim(),       
          contact_phone: vendor.contactPhone.trim(), 
          working_hours: vendor.workingHours.trim(), 
          has_completed_setup: true,
          updated_at: new Date().toISOString()
        });

      if (dbError) {
        alert(`DATABASE REJECTION ERROR: ${dbError.message.toUpperCase()}`);
        return;
      }

      setVendor(prev => ({ 
        ...prev, 
        hasCompletedSetup: true, 
        id: String(appUser.user_id),
        name: prev.name || appUser.full_name
      }));
      setActiveTab('orders'); 
      alert("SUCCESS: Storefront parameters layout synced to database!");

    } catch (err) {
      alert("SERVER TIMEOUT: Connection breakdown to local environment registry.");
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        alert(`LOGOUT FAILED: ${error.message.toUpperCase()}`);
        return;
      }
      router.replace('/');
    } catch (err) {
      alert("SERVER ERROR: Disconnection timed out.");
    }
  };

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {vendor.hasCompletedSetup ? vendor.name.toUpperCase() : "ACCOUNT SETUP GATE"}
          </Text>
          <Text style={styles.portalTag}>CAMPUS FOOD VENDOR NETWORK</Text>
        </View>
        
        <View style={styles.actionHeaderRight}>
          {vendor.name.trim().length > 0 && (
            <View style={styles.nameBadgeContainer}>
              <Text style={styles.nameBadgeText} numberOfLines={1}>
                👤 {vendor.name.toUpperCase()}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.logoutButtonInline} onPress={handleLogout}>
            <Text style={styles.logoutButtonTextInline}>LOG OUT</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.workspace} contentContainerStyle={{ paddingBottom: 30 }}>
        
        {activeTab === 'orders' && vendor.hasCompletedSetup && (
          <View style={styles.ordersContainer}>
            <View style={styles.titleBannerContainer}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.sectionTitle}>ORDERS PIPELINE</Text>
                <Text style={styles.standSubTitle}>📍 Locality: {vendor.standName}</Text>
              </View>
              <View style={styles.hoursBadge}>
                <Text style={styles.hoursBadgeText}>🕒 {vendor.workingHours}</Text>
              </View>
            </View>
            
            <Text style={styles.listHeading}>Active Student Queue</Text>
            
            {orders.map(order => (
              <TouchableOpacity
                key={order.id}
                onPress={() => setSelectedOrderId(order.id)}
                style={[
                  styles.orderCard, 
                  selectedOrderId === order.id && styles.selectedCard,
                  order.status === 'ready' && styles.readyBorderCard
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.orderId}>Order #{order.id}</Text>
                  <View style={[
                    styles.statusBadge, 
                    { 
                      backgroundColor: 
                        order.status === 'ready' ? '#10B981' : 
                        order.status === 'preparing' ? '#3182CE' : 
                        order.status === 'completed' ? '#718096' : '#ED8936' 
                    }
                  ]}>
                    <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.orderDetail}>
                  <Text style={{ fontWeight: '700', color: '#0B2977' }}>{order.student}</Text>: {order.items}
                </Text>
                <Text style={styles.orderTotal}>Total: {order.total}</Text>
              </TouchableOpacity>
            ))}

            {selectedOrder && (
              <View style={styles.detailsControlModule}>
                <Text style={styles.moduleTitle}>Update Order #{selectedOrder.id}</Text>
                <Text style={styles.label}>TAP TO MUTATE PIPELINE STATUS:</Text>
                <View style={styles.statusButtonRow}>
                                    {(['pending', 'preparing', 'ready', 'completed'] as const).map(status => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => handleStatusChange(selectedOrder.id, status)}
                      style={[
                        styles.statusSelectButton, 
                        selectedOrder.status === status && styles.activeStatusSelectButton,
                        selectedOrder.status === status && status === 'ready' && { backgroundColor: '#10B981' }
                      ]}
                    >
                      <Text style={[
                        styles.statusSelectText, 
                        selectedOrder.status === status && styles.activeStatusSelectText,
                        selectedOrder.status === status && status === 'ready' && { color: '#FFFFFF' }
                      ]}>
                        {status.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* VIEW TAB 2: MENU MODULE PLACEHOLDER */}
        {activeTab === 'menu' && vendor.hasCompletedSetup && (
          <View style={styles.centeredView}>
            <View style={styles.placeholderIconContainer}>
              <Text style={{ fontSize: 36 }}>🍔</Text>
            </View>
            <Text style={styles.placeholderText}>Menu Management System Coming Soon</Text>
          </View>
        )}

        {/* VIEW TAB 3: MANAGEMENT GATE SETUP FORM VIEW */}
        {activeTab === 'profile' && (
          <View style={styles.detailsControlModule}>
            <Text style={styles.formMainTitle}>Configure Storefront Meta</Text>
            <Text style={styles.formSubTitle}>Enter your operational parameters to activate portal utilities.</Text>

            <Text style={styles.inputLabel}>CAMPUS LOCATION CAMPUS BLOCK PLACEMENT</Text>
            <TextInput 
              style={styles.inputField}
              value={vendor.standName}
              onChangeText={(text) => setVendor({ ...vendor, standName: text })}
              placeholder="e.g. Soshanguve South Cafeteria Block L"
              placeholderTextColor="#A0AEC0"
            />

            <Text style={styles.inputLabel}>STORE SERVICE CONTACT PHONE NUMBER</Text>
            <TextInput 
              style={styles.inputField}
              value={vendor.contactPhone}
              onChangeText={(text) => setVendor({ ...vendor, contactPhone: text })}
              keyboardType="phone-pad"
              placeholder="e.g. +27 12 382 9000"
              placeholderTextColor="#A0AEC0"
            />

            <Text style={styles.inputLabel}>DAILY OPERATIONAL WORKING HOURS CYCLE</Text>
            <TextInput 
              style={styles.inputField}
              value={vendor.workingHours}
              onChangeText={(text) => setVendor({ ...vendor, workingHours: text })}
              placeholder="e.g. 08:00 AM - 05:00 PM"
              placeholderTextColor="#A0AEC0"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveSetup}>
              <Text style={styles.saveButtonText}>
                {vendor.hasCompletedSetup ? "UPDATE CONFIGURATIONS" : "LAUNCH VENDOR PORTAL 🚀"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* FOOTER NAVIGATION BAR */}
      <View style={styles.tabBar}>
        {vendor.hasCompletedSetup ? (
          (['orders', 'menu', 'profile'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'profile' ? "EDIT SETUP" : tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.lockedTabBarBanner}>
            <Text style={styles.lockedTabBarText}>⚠️ FILL IN STORE PROFILE METADATA TO UNLOCK DASHBOARD TABS</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { backgroundColor: '#0B2977', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 4, borderColor: '#FFCC00', shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  portalTag: { color: '#FFCC00', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 2 },
  actionHeaderRight: { flexDirection: 'row', alignItems: 'center' },
  nameBadgeContainer: { backgroundColor: 'rgba(255, 255, 255, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8, maxWidth: 130, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.25)' },
  nameBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.25 },
  logoutButtonInline: { backgroundColor: '#E53E3E', paddingVertical: 7, paddingHorizontal: 12, borderRadius: 8, elevation: 2 },
  logoutButtonTextInline: { color: '#FFFFFF', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  workspace: { flex: 1 },
  ordersContainer: { padding: 16 },
  titleBannerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 14, marginBottom: 20, borderLeftWidth: 5, borderLeftColor: '#0B2977', elevation: 2 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#0B2977', letterSpacing: 0.5 },
  standSubTitle: { fontSize: 13, fontWeight: '700', color: '#4A5568', marginTop: 3 },
  hoursBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#BFDBFE' },
  hoursBadgeText: { color: '#1E40AF', fontSize: 11, fontWeight: '800' },
  listHeading: { fontSize: 13, fontWeight: '800', color: '#64748B', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.75 },
  orderCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  selectedCard: { borderColor: '#0B2977', backgroundColor: '#EFF6FF', borderWidth: 2 },
  readyBorderCard: { borderLeftWidth: 6, borderLeftColor: '#10B981' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontWeight: '900', fontSize: 15, color: '#0B2977' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  orderDetail: { fontSize: 14, color: '#334155', lineHeight: 20, marginVertical: 4 },
  orderTotal: { color: '#10B981', fontWeight: '800', marginTop: 6 },
  detailsControlModule: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  formMainTitle: { fontSize: 18, fontWeight: '900', color: '#0B2977', marginBottom: 4 },
  formSubTitle: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 20 },
  inputLabel: { color: '#334155', fontSize: 11, fontWeight: '800', marginBottom: 6, letterSpacing: 0.5 },
  inputField: { width: '100%', height: 48, backgroundColor: '#F8FAFC', borderRadius: 10, paddingHorizontal: 14, fontSize: 14, color: '#1E293B', fontWeight: '600', borderWidth: 1, borderColor: '#CBD5E1', marginBottom: 16 },
  saveButton: { width: '100%', height: 50, backgroundColor: '#FFCC00', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 8, shadowColor: '#FFCC00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 2 },
  saveButtonText: { color: '#0B2977', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  moduleTitle: { fontSize: 15, fontWeight: '900', color: '#0B2977', marginBottom: 12 },
  label: { color: '#64748B', fontSize: 11, fontWeight: '700', marginBottom: 8 },
  statusButtonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  statusSelectButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  activeStatusSelectButton: { backgroundColor: '#0B2977' },
  statusSelectText: { color: '#334155', fontSize: 11, fontWeight: '800' },
  activeStatusSelectText: { color: '#FFCC00' },
  tabBar: { flexDirection: 'row', height: 65, backgroundColor: '#1E293B', borderTopWidth: 3, borderColor: '#FFCC00' },
  tabButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  activeTabButton: { backgroundColor: '#0B2977' },
  tabText: { color: '#94A3B8', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  activeTabText: { color: '#FFCC00', fontWeight: '900' },
  lockedTabBarBanner: { flex: 1, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15 },
  lockedTabBarText: { color: '#FFCC00', fontSize: 10, fontWeight: '800', textAlign: 'center', letterSpacing: 0.5 },
  centeredView: { alignItems: 'center', justifyContent: 'center', paddingVertical: 120 },
  placeholderIconContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  placeholderText: { color: '#64748B', fontWeight: '700', fontSize: 14 }
});
