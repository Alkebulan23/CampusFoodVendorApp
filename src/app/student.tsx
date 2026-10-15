import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../supabaseClient";

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
  vendorId: string | null;
}

export interface ActiveOrder {
  id: string;
  vendor: string;
  items: string;
  total: string;
  status: string;
}

interface VendorMealRecord {
  id: string;
  name: string;
  price: number | string;
  description: string | null;
  vendor_id: string | null;
}

interface VendorDetailsRecord {
  id: string;
  stand_name: string | null;
}

interface StudentOrderRecord {
  id: string | number;
  vendor_id: string;
  items_summary: string | null;
  total_price: number | string;
  status: string;
}

async function fetchStudentOrders(
  studentId: string,
): Promise<{ orders: ActiveOrder[]; error: string | null }> {
  const { data: orderRecords, error } = await supabase
    .from("orders")
    .select("id, vendor_id, items_summary, total_price, status")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) {
    return { orders: [], error: error.message };
  }

  const orders = (orderRecords || []) as StudentOrderRecord[];
  const vendorIds = [...new Set(orders.map((order) => order.vendor_id))];
  const vendorNames = new Map<string, string>();

  if (vendorIds.length > 0) {
    const { data: vendorRecords, error: vendorError } = await supabase
      .from("vendor_details")
      .select("id, stand_name")
      .in("id", vendorIds);

    if (vendorError) {
      console.error("Error loading order vendor names:", vendorError.message);
    } else {
      (vendorRecords || []).forEach((vendor: VendorDetailsRecord) => {
        if (vendor.stand_name) {
          vendorNames.set(vendor.id, vendor.stand_name);
        }
      });
    }
  }

  return {
    orders: orders.map((order) => ({
      id: String(order.id),
      vendor: vendorNames.get(order.vendor_id) || "TUT Campus Vendor Hub",
      items: order.items_summary || "Order details unavailable",
      total: `R${Number(order.total_price).toFixed(2)}`,
      status: order.status || "unknown",
    })),
    error: null,
  };
}

export default function StudentDashboard() {
  const router = useRouter();

  // Navigation and layout component states
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"meals" | "cart" | "status">(
    "meals",
  );

  // Dynamic state arrays linked across shared table channels
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [menuError, setMenuError] = useState("");
  const [studentName, setStudentName] = useState("Student");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [studentOrders, setStudentOrders] = useState<ActiveOrder[]>([]);
  const [ordersError, setOrdersError] = useState("");
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Hook layout to pull authentic foods from the database workspace on mount
  useEffect(() => {
    async function fetchLiveCampusMenus() {
      try {
        const [
          {
            data: { user },
            error: authError,
          },
          { data: foodRecords, error },
        ] = await Promise.all([
          supabase.auth.getUser(),
          supabase
            .from("food_items")
            .select("id, name, price, description, vendor_id")
            .eq("is_available", true),
        ]);

        if (authError) {
          console.error("Error loading student profile:", authError.message);
        } else {
          const fullName = user?.user_metadata?.full_name;
          if (typeof fullName === "string" && fullName.trim()) {
            setStudentName(fullName.trim());
          }
        }

        if (error) {
          console.error("Error loading menus:", error.message);
          setMenuError(error.message);
          setMenuItems([]);
          return;
        }

        const meals = (foodRecords || []) as VendorMealRecord[];
        const vendorIds = [
          ...new Set(
            meals
              .map((meal) => meal.vendor_id)
              .filter((vendorId): vendorId is string => Boolean(vendorId)),
          ),
        ];
        const vendorNames = new Map<string, string>();

        if (vendorIds.length > 0) {
          const { data: vendorRecords, error: vendorError } = await supabase
            .from("vendor_details")
            .select("id, stand_name")
            .in("id", vendorIds);

          if (vendorError) {
            console.error("Error loading vendor names:", vendorError.message);
          } else {
            (vendorRecords || []).forEach((vendor: VendorDetailsRecord) => {
              if (vendor.stand_name) {
                vendorNames.set(vendor.id, vendor.stand_name);
              }
            });
          }
        }

        const parsedMeals: FoodItem[] = meals.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          description: item.description
            ? `Freshly prepared with: ${item.description}.`
            : "Freshly prepared by a campus vendor.",
          vendor:
            (item.vendor_id && vendorNames.get(item.vendor_id)) ||
            "TUT Campus Vendor Hub",
          vendorId: item.vendor_id,
        }));
        setMenuError("");
        setMenuItems(parsedMeals);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unexpected error loading meals.";
        console.error("Error loading menus:", message);
        setMenuError(message);
        setMenuItems([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLiveCampusMenus();
  }, []);

  useEffect(() => {
    let isActive = true;
    let ordersChannel: ReturnType<typeof supabase.channel> | undefined;

    async function loadStudentOrders(studentId: string) {
      const { orders, error } = await fetchStudentOrders(studentId);

      if (!isActive) return;

      if (error) {
        console.error("Error loading student orders:", error);
        setOrdersError(error);
        return;
      }

      setStudentOrders(orders);
      setOrdersError("");
    }

    async function subscribeToStudentOrders() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (!isActive) return;
        if (authError || !user) {
          const message =
            authError?.message || "Sign in to view your order status.";
          console.error("Could not identify student for order tracking:", message);
          setOrdersError(message);
          return;
        }

        await loadStudentOrders(user.id);
        if (!isActive) return;

        ordersChannel = supabase
          .channel(`student-orders-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "orders",
              filter: `student_id=eq.${user.id}`,
            },
            () => {
              void loadStudentOrders(user.id);
            },
          )
          .subscribe((status, error) => {
            if (
              isActive &&
              (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
            ) {
              const message =
                error instanceof Error
                  ? error.message
                  : error || "Live order updates are temporarily unavailable.";
              console.error("Student order subscription failed:", message);
              setOrdersError(message);
            }
          });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unexpected error loading orders.";
        console.error("Error synchronizing student orders:", message);
        if (isActive) setOrdersError(message);
      } finally {
        if (isActive) setIsLoadingOrders(false);
      }
    }

    void subscribeToStudentOrders();

    return () => {
      isActive = false;
      if (ordersChannel) {
        void supabase.removeChannel(ordersChannel);
      }
    };
  }, []);

  const addToCart = (item: FoodItem) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === item.id);
      if (existing) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prevCart,
        { id: item.id, name: item.name, price: item.price, quantity: 1 },
      ];
    });
    alert(`${item.name} added to your food basket!`);
  };

  // 🛒 NEW OPERATION ACTION: Allows students to decrement volumes or drop items cleanly
  const updateQuantity = (itemId: string, amount: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === itemId) {
            const targetQuantity = item.quantity + amount;
            return targetQuantity > 0
              ? { ...item, quantity: targetQuantity }
              : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const calculateTotal = () => {
    const sum = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    return `R${sum.toFixed(2)}`;
  };

  // Dispatch orders into mock structures or database states
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    setIsPlacingOrder(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        alert(authError?.message || "Please sign in before placing an order.");
        return;
      }

      const menuById = new Map(menuItems.map((item) => [item.id, item]));
      const vendorOrderGroups = new Map<
        string,
        { vendor: string; items: CartItem[] }
      >();

      for (const cartItem of cart) {
        const meal = menuById.get(cartItem.id);
        if (!meal?.vendorId) {
          alert(
            `Could not identify the vendor for ${cartItem.name}. Please refresh the meals menu and try again.`,
          );
          return;
        }

        const group = vendorOrderGroups.get(meal.vendorId) || {
          vendor: meal.vendor,
          items: [],
        };
        group.items.push(cartItem);
        vendorOrderGroups.set(meal.vendorId, group);
      }

      const orderRows = [...vendorOrderGroups.entries()].map(
        ([vendorId, group]) => ({
          student_id: user.id,
          vendor_id: vendorId,
          items_summary: group.items
            .map((item) => `${item.quantity}x ${item.name}`)
            .join(", "),
          total_price: group.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          ),
          status: "new",
        }),
      );

      const { error: orderError } = await supabase
        .from("orders")
        .insert(orderRows);

      if (orderError) {
        alert(`Could not save your order: ${orderError.message}`);
        return;
      }

      const { orders, error } = await fetchStudentOrders(user.id);
      if (error) {
        console.error("Error refreshing student orders:", error);
        setOrdersError(error);
      } else {
        setStudentOrders(orders);
        setOrdersError("");
      }

      alert("Order successfully dispatched to vendor workspace queue!");
      setCart([]);
      setActiveTab("status");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error placing order.";
      alert(`Could not save your order: ${message}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/");
    } catch (err) {
      alert("Error logging out.");
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#0B2977" />
        <Text style={{ marginTop: 12, fontWeight: "700", color: "#0B2977" }}>
          Synchronizing Digital Campus Menus...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* --- TOP APP HEADER NAVIGATION ROW --- */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Text style={styles.hamburgerIcon}>{isMenuOpen ? "✕" : "☰"}</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.welcomeGreeting}>Welcome, {studentName}!</Text>
          <Text style={styles.portalTag}>TUT MEALS PORTAL</Text>
        </View>
      </View>

      <View style={styles.mainLayoutBody}>
        {/* --- SIDEBAR DRAWER COLLAPSIBLE CONTAINER PANEL --- */}
        {isMenuOpen && (
          <View style={styles.drawerSidebar}>
            <Text style={styles.drawerSectionHeading}>PORTAL OPTIONS</Text>

            <TouchableOpacity
              style={[
                styles.drawerItemButton,
                activeTab === "meals" && styles.drawerItemActive,
              ]}
              onPress={() => {
                setActiveTab("meals");
                setIsMenuOpen(false);
              }}
            >
              <Text
                style={[
                  styles.drawerItemText,
                  activeTab === "meals" && styles.drawerItemTextActive,
                ]}
              >
                🍔 Meals
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.drawerItemButton,
                activeTab === "cart" && styles.drawerItemActive,
              ]}
              onPress={() => {
                setActiveTab("cart");
                setIsMenuOpen(false);
              }}
            >
              <Text
                style={[
                  styles.drawerItemText,
                  activeTab === "cart" && styles.drawerItemTextActive,
                ]}
              >
                🛒 Cart {cart.length > 0 ? `(${cart.length})` : ""}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.drawerItemButton,
                activeTab === "status" && styles.drawerItemActive,
              ]}
              onPress={() => {
                setActiveTab("status");
                setIsMenuOpen(false);
              }}
            >
              <Text
                style={[
                  styles.drawerItemText,
                  activeTab === "status" && styles.drawerItemTextActive,
                ]}
              >
                📦 Order Management System
              </Text>
            </TouchableOpacity>

            <View style={styles.drawerSpacer} />

            <TouchableOpacity
              style={styles.drawerLogoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.drawerLogoutText}>🚪 Log Out</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* --- PRIMARY WORKSPACE CORE DISPATCH DISPLAY VIEWPORT --- */}
        <ScrollView
          style={styles.workspace}
          contentContainerStyle={styles.scrollContent}
        >
          {/* View Tab 1: Meals Browse Menu Listings */}
          {activeTab === "meals" && (
            <View style={styles.innerContainer}>
              <Text style={styles.sectionTitle}>
                Available Campus Vendor Menus
              </Text>
              {menuError ? (
                <Text style={styles.emptyText}>
                  Could not load vendor meals: {menuError}
                </Text>
              ) : menuItems.length === 0 ? (
                <Text style={styles.emptyText}>
                  No vendor meals are available yet.
                </Text>
              ) : (
                menuItems.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>
                        R{item.price.toFixed(2)}
                      </Text>
                    </View>
                    <Text style={styles.itemDescription}>
                      {item.description}
                    </Text>
                    <Text style={styles.itemVendor}>
                      Sold by: {item.vendor}
                    </Text>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => addToCart(item)}
                    >
                      <Text style={styles.actionButtonText}>ADD TO BASKET</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}

          {/* View Tab 2: Shopping Cart Basket Checklist */}
          {activeTab === "cart" && (
            <View style={styles.innerContainer}>
              <Text style={styles.sectionTitle}>Your Selected Items</Text>
              {cart.length === 0 ? (
                <Text style={styles.emptyText}>
                  Your food basket is currently empty.
                </Text>
              ) : (
                <View>
                  {cart.map((item) => (
                    <View key={item.id} style={styles.cartRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cartItemText}>{item.name}</Text>
                        <Text style={styles.cartItemPriceText}>
                          R{(item.price * item.quantity).toFixed(2)}
                        </Text>
                      </View>

                      {/* 🛒 MULTI-OPTION ADJUSTMENT ROW CONTROLS */}
                      <View style={styles.quantityControlGroup}>
                        <TouchableOpacity
                          style={styles.calcButton}
                          onPress={() => updateQuantity(item.id, -1)}
                        >
                          <Text style={styles.calcButtonText}>-</Text>
                        </TouchableOpacity>

                        <Text style={styles.quantityCounterText}>
                          {item.quantity}
                        </Text>

                        <TouchableOpacity
                          style={styles.calcButton}
                          onPress={() => updateQuantity(item.id, 1)}
                        >
                          <Text style={styles.calcButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  <View style={styles.totalDivider} />

                  <View style={styles.cartRow}>
                    <Text style={styles.totalLabel}>Basket Total:</Text>
                    <Text style={styles.totalValue}>{calculateTotal()}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={handlePlaceOrder}
                    disabled={isPlacingOrder}
                  >
                    <Text style={styles.checkoutButtonText}>
                      {isPlacingOrder
                        ? "SAVING ORDER..."
                        : "CONFIRM & PLACE ORDER"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* View Tab 3: Live Order Status Progress Pipeline */}
          {activeTab === "status" && (
            <View style={styles.innerContainer}>
              <Text style={styles.sectionTitle}>Live Order Tracker</Text>
              {ordersError ? (
                <Text style={styles.emptyText}>
                  Could not sync order updates: {ordersError}
                </Text>
              ) : null}
              {isLoadingOrders ? (
                <ActivityIndicator color="#0B2977" />
              ) : studentOrders.length === 0 ? (
                <Text style={styles.emptyText}>
                  You do not have any orders right now.
                </Text>
              ) : (
                studentOrders.map((order) => (
                  <View key={order.id} style={styles.statusDisplayCard}>
                    <Text style={styles.orderLabel}>ORDER REFERENCE:</Text>
                    <Text style={styles.orderValue}>#{order.id}</Text>

                    <Text style={styles.orderLabel}>VENDOR:</Text>
                    <Text style={styles.orderValue}>{order.vendor}</Text>

                    <Text style={styles.orderLabel}>ITEMS:</Text>
                    <Text style={styles.orderValue}>{order.items}</Text>

                    <View style={styles.pipelineRow}>
                      <View style={styles.orderTotalWrap}>
                        <Text style={styles.orderLabel}>TOTAL:</Text>
                        <Text style={styles.orderTotal}>{order.total}</Text>
                      </View>
                      <View style={styles.badgeElement}>
                        <Text style={styles.badgeText}>
                          {order.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
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
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "#0B2977",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 4,
    borderColor: "#FFCC00",
  },
  hamburgerButton: {
    padding: 8,
    marginRight: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
  },
  hamburgerIcon: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold" },
  headerTitleWrap: { flex: 1 },
  welcomeGreeting: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  portalTag: {
    color: "#FFCC00",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 2,
  },
  mainLayoutBody: { flex: 1, flexDirection: "row" },
  drawerSidebar: {
    width: 260,
    backgroundColor: "#1E293B",
    padding: 16,
    borderRightWidth: 1,
    borderColor: "#334155",
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
  },
  drawerSectionHeading: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 12,
    paddingLeft: 4,
  },
  drawerItemButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  drawerItemActive: { backgroundColor: "#0B2977" },
  drawerItemText: { color: "#94A3B8", fontSize: 13, fontWeight: "700" },
  drawerItemTextActive: { color: "#FFCC00", fontWeight: "900" },
  drawerSpacer: { flex: 1 },
  drawerLogoutButton: {
    backgroundColor: "#E53E3E",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  drawerLogoutText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  workspace: { flex: 1, padding: 20 },
  scrollContent: { paddingBottom: 30 },
  innerContainer: { width: "100%" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0B2977",
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  itemName: { fontSize: 16, fontWeight: "800", color: "#1A202C" },
  itemPrice: { fontSize: 16, fontWeight: "900", color: "#0B2977" },
  itemDescription: {
    fontSize: 13,
    color: "#4A5568",
    lineHeight: 18,
    marginBottom: 8,
  },
  itemVendor: {
    fontSize: 11,
    color: "#718096",
    fontWeight: "700",
    fontStyle: "italic",
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: "#0B2977",
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#FFCC00",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 1,
  },
  cartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  cartItemText: { fontSize: 15, fontWeight: "800", color: "#2D3748" },
  cartItemPriceText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0B2977",
    marginTop: 2,
  },
  totalDivider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 15 },
  totalLabel: { fontSize: 16, fontWeight: "900", color: "#0B2977" },
  totalValue: { fontSize: 18, fontWeight: "900", color: "#0B2977" },
  checkoutButton: {
    backgroundColor: "#FFCC00",
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
    shadowColor: "#FFCC00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  checkoutButtonText: {
    color: "#0B2977",
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 1,
  },
  emptyText: {
    color: "#718096",
    textAlign: "center",
    marginTop: 40,
    fontWeight: "600",
    fontSize: 14,
  },
  statusDisplayCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  orderLabel: {
    color: "#718096",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  orderValue: {
    color: "#1A202C",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  statusDivider: {
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 1,
    marginVertical: 10,
  },
  pipelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  orderTotalWrap: { flex: 1 },
  orderTotal: {
    color: "#0B2977",
    fontSize: 15,
    fontWeight: "900",
  },
  currentStatusLabel: { fontSize: 12, fontWeight: "900", color: "#0B2977" },
  badgeElement: {
    backgroundColor: "#FFCC00",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: "#0B2977",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  // 🛒 BUTTON STYLES FOR THE QUANTITY ADJUSTER CONTROLS
  quantityControlGroup: { flexDirection: "row", alignItems: "center", gap: 12 },
  calcButton: {
    backgroundColor: "#0B2977",
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  calcButtonText: { color: "#FFCC00", fontSize: 18, fontWeight: "bold" },
  quantityCounterText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A202C",
    minWidth: 20,
    textAlign: "center",
  },
});
