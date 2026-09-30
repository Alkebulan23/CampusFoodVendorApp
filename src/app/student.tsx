import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Explicit TS data model definitions
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  description: string;
  vendor: string;
}

export default function StudentDashboard() {
  // Navigation layout tracking state
  const [activeTab, setActiveTab] = useState<'browse' | 'cart' | 'status'>('browse');

  // Static mockup items matching local campus favorite menu standards
  const [menuItems] = useState<FoodItem[]>([
    { id: "M1", name: "Standard Kota", price: 35.00, description: "Chips, polony, special sauce, and half-loaf bread.", vendor: "TUT Campus Delights" },
    { id: "M2", name: "Full House Deluxe Kota", price: 48.00, description: "Russian sausage, egg, chips, double cheese, and sauces.", vendor: "TUT Campus Delights" },
    { id: "M3", name: "Quarter Chicken Combo", price: 65.00, description: "Flame-grilled quarter chicken with savoury rice and small chips.", vendor: "Sosh Cafeteria Hub" },
    { id: "M4", name: "Boerewors Roll", price: 30.00, description: "Traditional spiced boerewors with grilled onions on a fresh roll.", vendor: "Sosh Cafeteria Hub" }
  ]);

  // Shopping cart management tracking state array
  const [cart, setCart] = useState<CartItem[]>([
    { id: "M2", name: "Full House Deluxe Kota", price: 48.00, quantity: 1 }
  ]);

  // Current order execution tracking simulation loop parameters
  const [activeOrder] = useState({
    id: "TUT-8831",
    vendor: "TUT Campus Delights",
    items: "Full House Deluxe Kota + Sprite Combo",
    total: "R48.00",
    status: "preparing" // pending -> preparing -> ready -> completed
  });

  const addToCart = (item: FoodItem) => {
    setCart(prevCart => {
      const existing = prevCart.find(i => i.id === item.id);
      if (existing) {
        return prevCart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prevCart, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
    alert(`${item.name} added to your food basket!`);
  };

  const calculateTotal = () => {
    const sum = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return `R${sum.toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Header Banner Block matching UI standards */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{activeTab.toUpperCase()}</Text>
          <Text style={styles.studentSub}>Campus Student Hub</Text>
        </View>
        <Text style={styles.portalTag}>TUT MEALS</Text>
      </View>

      {/* Primary Scroll Workspace Area */}
      <ScrollView style={styles.workspace} contentContainerStyle={styles.scrollContent}>
        
        {/* View Tab 1: Browse Menu Listings */}
        {activeTab === 'browse' && (
          <View style={styles.innerContainer}>
            <Text style={styles.sectionTitle}>Available Campus Vendor Menus</Text>
            {menuItems.map(item => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>R{item.price.toFixed(2)}</Text>
                </View>
                <Text style={styles.itemDescription}>{item.description}</Text>
                <Text style={styles.itemVendor}>Sold by: {item.vendor}</Text>
                
                <TouchableOpacity style={styles.actionButton} onPress={() => addToCart(item)}>
                  <Text style={styles.actionButtonText}>ADD TO BASKET</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* View Tab 2: Shopping Cart Basket Checklist */}
        {activeTab === 'cart' && (
          <View style={styles.innerContainer}>
            <Text style={styles.sectionTitle}>Your Selected Items</Text>
            {cart.length === 0 ? (
              <Text style={styles.emptyText}>Your food basket is currently empty.</Text>
            ) : (
              <View>
                {cart.map(item => (
                  <View key={item.id} style={styles.cartRow}>
                    <Text style={styles.cartItemText}>{item.quantity}x {item.name}</Text>
                    <Text style={styles.cartItemPrice}>R{(item.price * item.quantity).toFixed(2)}</Text>
                  </View>
                ))}
                <View style={styles.totalDivider} />
                <View style={styles.cartRow}>
                  <Text style={styles.totalLabel}>Basket Total:</Text>
                  <Text style={styles.totalValue}>{calculateTotal()}</Text>
                </View>

                <TouchableOpacity style={styles.checkoutButton} onPress={() => alert("Order successfully dispatched to vendor workspace queue!")}>
                  <Text style={styles.checkoutButtonText}>CONFIRM & PLACE ORDER</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* View Tab 3: Live Order Status Progress Pipeline */}
        {activeTab === 'status' && (
          <View style={styles.innerContainer}>
            <Text style={styles.sectionTitle}>Live Order Tracker</Text>
            <View style={styles.statusDisplayCard}>
              <Text style={styles.orderLabel}>ORDER REFERENCING NUMBER:</Text>
              <Text style={styles.orderValue}>#{activeOrder.id}</Text>

              <Text style={styles.orderLabel}>PREPARING KITCHEN HUB:</Text>
              <Text style={styles.orderValue}>{activeOrder.vendor}</Text>

              <Text style={styles.orderLabel}>ITEMS ASSIGNED:</Text>
              <Text style={styles.orderValue}>{activeOrder.items}</Text>

              <View style={styles.statusDivider} />
              
              <View style={styles.pipelineRow}>
                <Text style={styles.currentStatusLabel}>PIPELINE STATUS STATE:</Text>
                <View style={styles.badgeElement}>
                  <Text style={styles.badgeText}>{activeOrder.status.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Mobile Footer Tab Bar Navigation Component Layout */}
      <View style={styles.tabBar}>
        {(['browse', 'cart', 'status'] as const).map(tab => (
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
  studentSub: { color: '#FFCC00', fontSize: 13, fontWeight: '700', marginTop: 2 },
  portalTag: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  workspace: { flex: 1, padding: 20 },
  scrollContent: { paddingBottom: 30 },
  innerContainer: { width: '100%' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#0B2977', marginBottom: 15, letterSpacing: 0.5 },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  itemName: { fontSize: 16, fontWeight: '800', color: '#1A202C' },
  itemPrice: { fontSize: 16, fontWeight: '900', color: '#0B2977' },
  itemDescription: { fontSize: 13, color: '#4A5568', lineHeight: 18, marginBottom: 8 },
  itemVendor: { fontSize: 11, color: '#718096', fontWeight: '700', fontStyle: 'italic', marginBottom: 12 },
  actionButton: {
    backgroundColor: '#0B2977',
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: { color: '#FFCC00', fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  cartRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, alignItems: 'center' },
  cartItemText: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  cartItemPrice: { fontSize: 14, fontWeight: '800', color: '#1A202C' },
  totalDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: '900', color: '#0B2977' },
  totalValue: { fontSize: 18, fontWeight: '900', color: '#0B2977' },
  checkoutButton: {
    backgroundColor: '#FFCC00',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  checkoutButtonText: { color: '#0B2977', fontWeight: '900', fontSize: 15, letterSpacing: 1 },
  emptyText: { color: '#718096', textAlign: 'center', marginTop: 40, fontWeight: '600' },
  statusDisplayCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#E2E8F0' },
  orderLabel: { color: '#718096', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
  orderValue: { color: '#1A202C', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  statusDivider: { height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 1, marginVertical: 10 },
  pipelineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  currentStatusLabel: { fontSize: 12, fontWeight: '900', color: '#0B2977' },
  badgeElement: { backgroundColor: '#FFCC00', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#0B2977', fontWeight: '900', fontSize: 11, letterSpacing: 0.5 },
  tabBar: { flexDirection: 'row', height: 65, backgroundColor: '#1A202C', borderTopWidth: 2, borderColor: '#FFCC00' },
  tabButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  activeTabButton: { backgroundColor: '#0B2977' },
  tabText: { color: '#A0AEC0', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  activeTabText: { color: '#FFCC00', fontWeight: '900' }
});
