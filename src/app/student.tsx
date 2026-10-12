import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabaseClient';

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
  const router = useRouter();

  // Sidebar Menu Toggle State
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Navigation layout tracking state: defaults to 'meals'
  const [activeTab, setActiveTab] = useState<'meals' | 'cart' | 'status'>('meals');

  // Static mockup items matching local campus favorite menu standards
  const [menuItems] = useState<FoodItem[]>([
    { id: "M1", name: "Standard Kota", price: 35.00, description: "Chips, polony, special sauce, and half-loaf bread.", vendor: "TUT Campus Delights" },
    { id: "M2", name: "Full House Deluxe Kota", price: 48.00, description: "Russian sausage, egg, chips, double cheese, and sauces.", vendor: "TUT Campus Delights" },
    { id: "M3", name: "Quarter Chicken Combo", price: 65.00, description: "Flame-grilled quarter chicken with savoury rice and small chips.", vendor: "Sosh Cafeteria Hub" },
    { id: "M4", name: "Boerewors Roll", price: 30.00, description: "Traditional spiced boerewors with grilled onions on a fresh roll.", vendor: "Sosh Cafeteria Hub" }
  ]);

  // Shopping cart starts completely empty until student adds something inside it
  const [cart, setCart] = useState<CartItem[]>([]);

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
          <Text style={styles.welcomeGreeting}>Welcome, Student!</Text>
          <Text style={styles.portalTag}>TUT MEALS PORTAL</Text>
        </View>
      </View>

      <View style={styles.mainLayoutBody}>
        {/* --- SIDEBAR DRAWER COLLAPSIBLE CONTAINER PANEL --- */}
        {isMenuOpen && (
          <View style={styles.drawerSidebar}>
            <Text style={styles.drawerSectionHeading}>PORTAL OPTIONS</Text>
            
            <TouchableOpacity 
              style={[styles.drawerItemButton, activeTab === 'meals' && styles.drawerItemActive]}
              onPress={() => { setActiveTab('meals'); setIsMenuOpen(false); }}
            >
              <Text style={[styles.drawerItemText, activeTab === 'meals' && styles.drawerItemTextActive]}>
                🍔 Meals
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.drawerItemButton, activeTab === 'cart' && styles.drawerItemActive]}
              onPress={() => { setActiveTab('cart'); setIsMenuOpen(false); }}
            >
              <Text style={[styles.drawerItemText, activeTab === 'cart' && styles.drawerItemTextActive]}>
                🛒 Cart {cart.length > 0 ? `(${cart.length})` : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.drawerItemButton, activeTab === 'status' && styles.drawerItemActive]}
              onPress={() => { setActiveTab('status'); setIsMenuOpen(false); }}
            >
              <Text style={[styles.drawerItemText, activeTab === 'status' && styles.drawerItemTextActive]}>
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
        <ScrollView style={styles.workspace} contentContainerStyle={styles.scrollContent}>
          
          {/* View Tab 1: Meals Browse Menu Listings */}
          {activeTab === 'meals' && (
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
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
  badgeText: { color: '#0B2977', fontWeight: '900', fontSize: 11, letterSpacing: 0.5 }
});

