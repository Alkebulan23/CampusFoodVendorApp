import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabaseClient';

export interface Order {
  id: string;
  items: string;
  total: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'new';
  student: string;
}

export interface VendorDetails {
  name: string; 
  standName: string; 
  contactPhone: string;
  workingHours: string;
}

export default function VendorDashboard() {
  const router = useRouter();

  // Sidebar Menu Toggle State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Current active viewport module: 'setup' or 'orders'
  const [activeModule, setActiveModule] = useState<'setup' | 'orders'>('orders');

  // Vendor Information Details State Tracking
  const [vendor, setVendor] = useState<VendorDetails>({
    name: "Mbali Nxumalo", // Fallback simulation name matching requested context placeholder
    standName: "Soshanguve South Cafeteria Block L", 
    contactPhone: "+27 12 382 9000",
    workingHours: "08:00 AM - 05:00 PM"
  });

  // Split Name Utility logic to salute vendor by first name cleanly
  const getFirstName = (fullName: string) => {
    if (!fullName) return "Vendor";
    return fullName.trim().split(" ")[0];
  };

  // Mock Orders Queue Dataset
  const [orders, setOrders] = useState<Order[]>([
    { id: "TUT-9901", items: "Standard Kota (Polony, Chips & Special Sauce)", total: "R35.00", status: 'new', student: "Kabelo M." },
    { id: "TUT-8831", items: "Full House Deluxe Kota + Sprite Combo", total: "R48.00", status: 'pending', student: "Zanele Ndlovu" },
    { id: "TUT-8832", items: "Quarter Chicken with Savoury Rice", total: "R65.00", status: 'preparing', student: "Sipho Khumalo" }
  ]);

  // Order Accept Workflow Handler 
  const handleAcceptOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'pending' } : o));
    alert(`Order #${orderId} accepted into execution pipeline!`);
  };

  // Order Decline Workflow Handler
  const handleDeclineOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    alert(`Order #${orderId} rejected and removed from queue.`);
  };

  // Mutate Active Order Tracking Progress State
  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  // Fire Live Push Alert out to Student Collection Hub Device
  const sendStudentAlert = (order: Order) => {
    alert(`🛎️ ALERT DISPATCHED:\n\nHey ${order.student}, your food from "${vendor.standName}" is cooked and hot! Please come collect your order reference #${order.id}.`);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/');
    } catch (err) {
      alert("Error logging out.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* --- TOP APP HEADER NAVIGATION ROW --- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.hamburgerButton} onPress={() => setIsMenuOpen(!isMenuOpen)}>
          <Text style={styles.hamburgerIcon}>{isMenuOpen ? "✕" : "☰"}</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.welcomeGreeting}>Welcome, {getFirstName(vendor.name)}!</Text>
          <Text style={styles.portalTag}>CAMPUS FOOD VENDOR NETWORK</Text>
        </View>
      </View>

      <View style={styles.mainLayoutBody}>
        {/* --- SIDEBAR DRAWER COLLAPSIBLE CONTAINER PANEL --- */}
        {isMenuOpen && (
          <View style={styles.drawerSidebar}>
            <Text style={styles.drawerSectionHeading}>PORTAL OPTIONS</Text>
            
            <TouchableOpacity 
              style={[styles.drawerItemButton, activeModule === 'setup' && styles.drawerItemActive]}
              onPress={() => { setActiveModule('setup'); setIsMenuOpen(false); }}
            >
              <Text style={[styles.drawerItemText, activeModule === 'setup' && styles.drawerItemTextActive]}>
                ⚙️ Account Setup Gate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.drawerItemButton, activeModule === 'orders' && styles.drawerItemActive]}
              onPress={() => { setActiveModule('orders'); setIsMenuOpen(false); }}
            >
              <Text style={[styles.drawerItemText, activeModule === 'orders' && styles.drawerItemTextActive]}>
                📦 Order Management System
              </Text>
            </TouchableOpacity>

            <View style={styles.drawerSpacer} />

            <TouchableOpacity style={styles.drawerLogoutButton} onPress={handleLogout}>
              <Text style={styles.drawerLogoutText}>🚪 Log Out</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* --- PRIMARY WORKSPACE CORE DISPATCH DISPLAY VIEWPORT --- */}
        <ScrollView style={styles.workspace} contentContainerStyle={{ padding: 16 }}>
          
          {/* OPTION VIEW 1: ACCOUNT SETUP GATE MODULE */}
          {activeModule === 'setup' && (
            <View style={styles.cardModule}>
              <Text style={styles.sectionTitle}>Account Setup Gate</Text>
              <Text style={styles.sectionSubtitle}>Maintain store operational metadata records below.</Text>

              <Text style={styles.inputLabel}>CAMPUS STAND LOCATION / PLACEMENT NAME</Text>
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

              <TouchableOpacity style={styles.saveButton} onPress={() => alert("Configurations updated locally!")}>
                <Text style={styles.saveButtonText}>SAVE CONFIGURATIONS</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* OPTION VIEW 2: ORDER MANAGEMENT SYSTEM MODULE */}
          {activeModule === 'orders' && (
            <View>
              {/* SUB-SECTION A: NEWLY INCOMING SYSTEM ORDERS */}
              <Text style={styles.moduleGroupHeading}>🆕 Newly Made Orders Queue</Text>
              {orders.filter(o => o.status === 'new').length === 0 ? (
                <Text style={styles.emptyStateMessageText}>No new incoming orders at present.</Text>
              ) : (
                orders.filter(o => o.status === 'new').map(order => (
                  <View key={order.id} style={[styles.orderCard, styles.newOrderBorder]}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.orderIdText}>Order #{order.id}</Text>
                      <Text style={styles.priceTagText}>{order.total}</Text>
                    </View>
                    <Text style={styles.orderDetailsText}><Text style={{fontWeight:'700'}}>{order.student}</Text>: {order.items}</Text>
                    
                    <View style={styles.actionButtonsRowLayout}>
                      <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptOrder(order.id)}>
                        <Text style={styles.acceptButtonText}>ACCEPT ORDER</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.declineButton} onPress={() => handleDeclineOrder(order.id)}>
                        <Text style={styles.declineButtonText}>DECLINE</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}

              {/* SUB-SECTION B: ACCEPTED ACTIVE ORDERS WORKSPACE MANAGEMENT ROW */}
              <Text style={[styles.moduleGroupHeading, { marginTop: 24 }]}>🍳 Accepted Working Orders</Text>
              {orders.filter(o => o.status !== 'new').length === 0 ? (
                <Text style={styles.emptyStateMessageText}>No active orders currently under processing cycle loops.</Text>
              ) : (
                orders.filter(o => o.status !== 'new').map(order => (
                  <View key={order.id} style={[styles.orderCard, order.status === 'ready' && styles.readyOrderCardBorder]}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.orderIdText}>Order #{order.id}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: order.status === 'ready' ? '#10B981' : order.status === 'preparing' ? '#3182CE' : '#ED8936' }]}>
                        <Text style={styles.statusBadgeText}>{order.status.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.orderDetailsText}><Text style={{fontWeight:'700'}}>{order.student}</Text>: {order.items}</Text>
                             <Text style={styles.stateMutationLabel}>MUTATE STATE PROGRESSION LAYER:</Text>
                    <View style={styles.statusTogglesRowButtonGroup}>
                      {(['pending', 'preparing', 'ready'] as const).map(status => (
                        <TouchableOpacity
                          key={status}
                          onPress={() => handleStatusChange(order.id, status)}
                          style={[styles.stateSelectionItemButton, order.status === status && styles.stateSelectionItemButtonActive]}
                        >
                          <Text style={[styles.stateSelectionItemButtonText, order.status === status && styles.stateSelectionItemButtonTextActive]}>
                            {status.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* CONTEXT DISPATCH TRIGGER GATES: SEND NOTIFICATION ALERTS TO STUDENTS WHEN FOOD IS READY */}
                    {order.status === 'ready' && (
                      <TouchableOpacity style={styles.alertStudentButton} onPress={() => sendStudentAlert(order)}>
                        <Text style={styles.alertStudentButtonText}>📢 ALERT STUDENT FOR COLLECTION</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </View>
          )}

        </ScrollView>
      </View>
    </View>
  );
}
           
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F1F5F9' 
  },
  header: { 
    backgroundColor: '#0B2977', 
    paddingHorizontal: 16, 
    paddingTop: 50, 
    paddingBottom: 18, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderBottomWidth: 4, 
    borderColor: '#FFCC00' 
  },
  hamburgerButton: { 
    padding: 8, 
    marginRight: 12, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 8 
  },
  hamburgerIcon: { 
    color: '#FFFFFF', 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  headerTitleWrap: { 
    flex: 1 
  },
  welcomeGreeting: { 
    color: '#FFFFFF', 
    fontSize: 22, 
    fontWeight: '900', 
    letterSpacing: 0.5 
  },
  portalTag: { 
    color: '#FFCC00', 
    fontSize: 10, 
    fontWeight: '800', 
    letterSpacing: 1.2, 
    marginTop: 2 
  },
  mainLayoutBody: { 
    flex: 1, 
    flexDirection: 'row' 
  },
  
  // Drawer Panel Elements Hierarchy
  drawerSidebar: { 
    width: 260, 
    backgroundColor: '#1E293B', 
    padding: 16, 
    borderRightWidth: 1, 
    borderColor: '#334155', 
    height: '100%', 
    position: 'absolute', 
    left: 0, 
    top: 0, 
    bottom: 0, 
    zIndex: 999 
  },
  drawerSectionHeading: { 
    color: '#64748B', 
    fontSize: 11, 
    fontWeight: '900', 
    letterSpacing: 1, 
    marginBottom: 12, 
    paddingLeft: 4 
  },
  drawerItemButton: { 
    paddingVertical: 12, 
    paddingHorizontal: 14, 
    borderRadius: 10, 
    marginBottom: 8 
  },
  drawerItemActive: { 
    backgroundColor: '#0B2977' 
  },
  drawerItemText: { 
    color: '#94A3B8', 
    fontSize: 13, 
    fontWeight: '700' 
  },
  drawerItemTextActive: { 
    color: '#FFCC00', 
    fontWeight: '900' 
  },
  drawerSpacer: { 
    flex: 1 
  },
  drawerLogoutButton: { 
    backgroundColor: '#E53E3E', 
    paddingVertical: 12, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 20 
  },
  drawerLogoutText: { 
    color: '#FFFFFF', 
    fontSize: 13, 
    fontWeight: '900', 
    letterSpacing: 0.5 
  },
  
  // Modules & Content Display Layout
  workspace: { 
    flex: 1 
  },
  cardModule: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    elevation: 2 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '900', 
    color: '#0B2977', 
    marginBottom: 2 
  },
  sectionSubtitle: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#64748B', 
    marginBottom: 18 
  },
  moduleGroupHeading: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: '#1E293B', 
    marginBottom: 10, 
    textTransform: 'uppercase', 
    letterSpacing: 0.5 
  },
  emptyStateMessageText: { 
    color: '#64748B', 
    fontStyle: 'italic', 
    paddingVertical: 8, 
    fontSize: 13, 
    paddingLeft: 4 
  },
  
  // Form Setup Configurations
  inputLabel: { 
    color: '#334155', 
    fontSize: 11, 
    fontWeight: '800', 
    marginBottom: 6, 
    letterSpacing: 0.5 
  },
  inputField: { 
    width: '100%', 
    height: 46, 
    backgroundColor: '#F8FAFC', 
    borderRadius: 10, 
    paddingHorizontal: 14, 
    fontSize: 14, 
    color: '#1E293B', 
    fontWeight: '600', 
    borderWidth: 1, 
    borderColor: '#CBD5E1', 
    marginBottom: 14 
  },
  saveButton: { 
    width: '100%', 
    height: 48, 
    backgroundColor: '#FFCC00', 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 10 
  },
  saveButtonText: { 
    color: '#0B2977', 
    fontSize: 13, 
    fontWeight: '900', 
    letterSpacing: 0.5 
  },
  
  // Order Card Layouts
  orderCard: { 
    backgroundColor: '#FFFFFF', 
    padding: 14, 
    borderRadius: 14, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  newOrderBorder: { 
    borderLeftWidth: 5, 
    borderLeftColor: '#ED8936' 
  },
  readyOrderCardBorder: { 
    borderLeftWidth: 5, 
    borderLeftColor: '#10B981', 
    borderColor: '#10B981' 
  },
  cardHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 6 
  },
  orderIdText: { 
    fontWeight: '900', 
    fontSize: 15, 
    color: '#0B2977' 
  },
  priceTagText: { 
    color: '#10B981', 
    fontWeight: '900', 
    fontSize: 14 
  },
  orderDetailsText: { 
    fontSize: 13, 
    color: '#334155', 
    lineHeight: 18, 
    marginBottom: 10 
  },
  statusBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 12 
  },
  statusBadgeText: { 
    color: '#FFFFFF', 
    fontSize: 9, 
    fontWeight: '800' 
  },
  
  // Action Buttons Row Layout
  actionButtonsRowLayout: { 
    flexDirection: 'row', 
    gap: 8 
  },
  acceptButton: { 
    flex: 2, 
    height: 38, 
    backgroundColor: '#0B2977', 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  acceptButtonText: { 
    color: '#FFCC00', 
    fontWeight: '800', 
    fontSize: 11, 
    letterSpacing: 0.5 
  },
  declineButton: { 
    flex: 1, 
    height: 38, 
    backgroundColor: '#E2E8F0', 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  declineButtonText: { 
    color: '#4A5568', 
    fontWeight: '800', 
    fontSize: 11 
  },
  
  // Custom Mutators State Switches Row Layout Components
  stateMutationLabel: { 
    color: '#64748B', 
    fontSize: 10, 
    fontWeight: '800', 
    marginBottom: 6, 
    textTransform: 'uppercase' 
  },
  statusTogglesRowButtonGroup: { 
    flexDirection: 'row', 
    gap: 6, 
    marginBottom: 4 
  },
  stateSelectionItemButton: { 
    flex: 1, 
    paddingVertical: 8, 
    borderRadius: 6, 
    backgroundColor: '#E2E8F0', 
    alignItems: 'center' 
  },
  stateSelectionItemButtonActive: { 
    backgroundColor: '#0B2977' 
  },
  stateSelectionItemButtonText: { 
    color: '#4A5568', 
    fontSize: 10, 
    fontWeight: '800' 
  },
  stateSelectionItemButtonTextActive: { 
    color: '#FFCC00' 
  },
  
  // Student Collection Alert Button
  alertStudentButton: { 
    backgroundColor: '#10B981', 
    height: 42, 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 12, 
    borderWidth: 1, 
    borderColor: '#059669' 
  },
  alertStudentButtonText: { 
    color: '#FFFFFF', 
    fontWeight: '900', 
    fontSize: 12, 
    letterSpacing: 0.5 
  }
});
