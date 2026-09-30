import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  campusHub: string;
  contactPhone: string;
}

export default function VendorDashboard() {
  // Navigation layout tracking state
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'profile'>('orders');
  
  // Selected single order state indicator target
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>("TUT-8831");

  // Core verified institutional vendor static parameters
  const [vendor] = useState<VendorDetails>({
    id: "VND-TUT-2026-X8",
    name: "TUT Campus Delights",
    campusHub: "Soshanguve South Campus, Main Cafeteria Block L",
    contactPhone: "+27 12 382 9000"
  });

  // Dynamic simulation queue list state hook mapping
  const [orders, setOrders] = useState<Order[]>([
    { id: "TUT-8831", items: "Kota (Russian, Chips & Cheese) + Sprite", total: "R48.00", status: 'pending', student: "Kabelo M." },
    { id: "TUT-8832", items: "Quarter Chicken with Savoury Rice", total: "R65.00", status: 'preparing', student: "Zanele Ndlovu" },
    { id: "TUT-8833", items: "Boerewors Roll & Chips Combo", total: "R40.00", status: 'ready', student: "Sipho Khumalo" }
  ]);

  // Handler for altering status mutations instantly inside the template view
  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Top Header Block styled exactly like the login header banner */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{activeTab.toUpperCase()}</Text>
          <Text style={styles.vendorName}>{vendor.name}</Text>
        </View>
        <Text style={styles.portalTag}>VENDOR PORTAL</Text>
      </View>

      {/* Primary Workspace Window View */}
      <ScrollView style={styles.workspace} contentContainerStyle={{ paddingBottom: 30 }}>
        
        {/* View Tab 1: Orders Pipeline Dashboard */}
        {activeTab === 'orders' && (
          <View style={styles.ordersContainer}>
            
            <Text style={styles.sectionTitle}>Active Student Queue</Text>
            
            {orders.map(order => (
              <TouchableOpacity
                key={order.id}
                onPress={() => setSelectedOrderId(order.id)}
                style={[
                  styles.orderCard, 
                  selectedOrderId === order.id && styles.selectedCard
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.orderId}>Order #{order.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: order.status === 'ready' ? '#10b981' : '#FFCC00' }]}>
                    <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.orderDetail}>
                  <Text style={{ fontWeight: '700', color: '#1A202C' }}>{order.student}</Text>: {order.items}
                </Text>
                <Text style={styles.orderTotal}>Total: {order.total}</Text>
              </TouchableOpacity>
            ))}

            {/* Quick Status Updater Module for Selected Order */}
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
                        selectedOrder.status === status && styles.activeStatusSelectButton
                      ]}
                    >
                      <Text style={[styles.statusSelectText, selectedOrder.status === status && styles.activeStatusSelectText]}>
                        {status.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* View Tab 2: Menu Module Placeholder */}
        {activeTab === 'menu' && (
          <View style={styles.centeredView}>
            <Text style={styles.placeholderText}>Menu Management System Coming Soon</Text>
          </View>
        )}

        {/* View Tab 3: Profile Details Module */}
        {activeTab === 'profile' && (
          <View style={styles.detailsControlModule}>
            <Text style={styles.moduleTitle}>Vendor Profile Details</Text>
            <Text style={styles.profileLabel}>VENDOR ID</Text>
            <Text style={styles.profileValue}>{vendor.id}</Text>
            
            <Text style={styles.profileLabel}>CAMPUS LOCATION HUB</Text>
            <Text style={styles.profileValue}>{vendor.campusHub}</Text>
            
            <Text style={styles.profileLabel}>CONTACT PHONE</Text>
            <Text style={styles.profileValue}>{vendor.contactPhone}</Text>
          </View>
        )}
      </ScrollView>

      {/* Mobile Footer Tab Bar Navigation Grid */}
      <View style={styles.tabBar}>
        {(['orders', 'menu', 'profile'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// MATCHES THE EXACT SAME COMPATIBLE DESIGN RULES AS THE INDEX LOGIN SCREEN
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { 
    backgroundColor: '#0B2977', 
    paddingHorizontal: 24, 
    paddingTop: 50, 
    paddingBottom: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomWidth: 3,
    borderColor: '#FFCC00'
  },
  headerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  vendorName: { color: '#FFCC00', fontSize: 13, fontWeight: '700', marginTop: 2 },
  portalTag: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  workspace: { flex: 1, padding: 20 },
  ordersContainer: { width: '100%' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#0B2977', marginBottom: 15, letterSpacing: 0.5 },
  orderCard: { 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderRadius: 14, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  selectedCard: { 
    borderColor: '#0B2977', 
    backgroundColor: '#F0F4FF',
    borderWidth: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontWeight: '900', fontSize: 15, color: '#0B2977' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: '#0B2977', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  orderDetail: { fontSize: 14, color: '#4A5568', lineHeight: 20 },
  orderTotal: { fontSize: 13, color: '#718096', fontWeight: '700', marginTop: 6 },
  
  // Status Control Module Styles
  detailsControlModule: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 16, 
    marginTop: 15, 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  moduleTitle: { fontSize: 15, fontWeight: '900', color: '#0B2977', marginBottom: 12 },
  label: { color: '#718096', fontSize: 11, fontWeight: '700', marginBottom: 8 },
  statusButtonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  statusSelectButton: { 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 8, 
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeStatusSelectButton: { backgroundColor: '#0B2977' },
  statusSelectText: { color: '#4A5568', fontSize: 11, fontWeight: '700' },
  activeStatusSelectText: { color: '#FFCC00' },
  
  // Profile styles
  profileLabel: { color: '#0B2977', fontSize: 11, fontWeight: '700', marginTop: 12, marginBottom: 2 },
  profileValue: { color: '#2D3748', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  
  // Tab Navigation Bar Styles
  tabBar: { flexDirection: 'row', height: 65, backgroundColor: '#1A202C', borderTopWidth: 2, borderColor: '#FFCC00' },
  tabButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  activeTabButton: { backgroundColor: '#0B2977' },
  tabText: { color: '#A0AEC0', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  activeTabText: { color: '#FFCC00', fontWeight: '900' },
  centeredView: { alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  placeholderText: { color: '#718096', fontWeight: '600', fontSize: 14 }
});
