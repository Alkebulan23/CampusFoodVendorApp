import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { supabase } from "../../supabaseClient";

export interface Order {
  id: string;
  items: string;
  total: string;
  status: "pending" | "preparing" | "ready" | "completed" | "new";
  student: string;
}

interface OrderRecord {
  id: string | number;
  items: string;
  total: string | number;
  status: Order["status"];
  student: string | null;
}

export interface VendorDetails {
  name: string;
  standName: string;
  contactPhone: string;
  workingHours: string;
}

export interface CustomFoodItem {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  ingredients: string[];
}

interface VendorMealRecord {
  id: string;
  name: string;
  price: number | string;
  description: string | null;
}

export default function VendorDashboard() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<
    "orders" | "setup" | "meals"
  >("orders");

  const [vendor, setVendor] = useState<VendorDetails>({
    name: "",
    standName: "",
    contactPhone: "",
    workingHours: "",
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersError, setOrdersError] = useState("");
  const [vendorMeals, setVendorMeals] = useState<CustomFoodItem[]>([]);
  const [vendorMealsError, setVendorMealsError] = useState("");
  const [isSavingMeal, setIsSavingMeal] = useState(false);

  const [newMealName, setNewMealName] = useState("");
  const [newMealPrice, setNewMealPrice] = useState("");
  const [newMealImage, setNewMealImage] = useState("");

  const [ingredients, setIngredients] = useState<string[]>([""]);

  useEffect(() => {
    async function fetchRealVendorIdentity() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/");
          return;
        }

        const { data: orderRecords, error: ordersLoadError } = await supabase
          .from("orders")
          .select("id, items_summary, total_price, status, student_id")
          .eq("vendor_id", user.id)
          .order("created_at", { ascending: false });

        if (ordersLoadError) {
          console.error(
            "Error loading vendor orders:",
            ordersLoadError.message,
          );
          setOrdersError(ordersLoadError.message);
        } else {
          setOrders(
            (orderRecords || []).map((order: any) => ({
              id: String(order.id),
              items: order.items_summary,
              total:
                typeof order.total_price === "number"
                  ? `R${order.total_price.toFixed(2)}`
                  : order.total_price,
              status: order.status,
              student: order.student_id || "Student",
            })),
          );

          setOrdersError("");
        }

        const realFullName = user.user_metadata?.full_name || "Food Vendor";

        const { data: databaseProfile, error: dbError } = await supabase
          .from("vendor_details")
          .select("stand_name, contact_phone, working_hours")
          .eq("id", user.id)
          .single();

        setVendor({
          name: realFullName,
          standName:
            databaseProfile?.stand_name || "Soshanguve South Cafeteria Block L",
          contactPhone: databaseProfile?.contact_phone || "+27 12 382 9000",
          workingHours: databaseProfile?.working_hours || "08:00 AM - 05:00 PM",
        });

        const { data: mealRecords, error: mealsError } = await supabase
          .from("food_items")
          .select("id, name, price, description") // ✅ use description
          .eq("vendor_id", user.id);

        if (mealsError) {
          console.error("Error loading vendor meals:", mealsError.message);
          setVendorMealsError(mealsError.message);
        } else {
          setVendorMeals(
            (mealRecords || []).map((meal: VendorMealRecord) => ({
              id: meal.id,
              name: meal.name,
              price: Number(meal.price).toFixed(2),
              imageUrl: "",
              ingredients: meal.description ? meal.description.split(",") : [], // ✅ parse description into array
            })),
          );
        }
      } catch (err) {
        console.log("Profile Sync breakdown:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRealVendorIdentity();
  }, []);

  const getFirstName = (fullName: string) => {
    if (!fullName) return "Vendor";
    return fullName.trim().split(" ")[0];
  };

  const persistOrderStatus = async (
    orderId: string,
    status: Order["status"],
  ) => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      alert(authError?.message || "Please sign in before updating an order.");
      return false;
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .eq("vendor_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      alert(`Could not update order status: ${error.message}`);
      return false;
    }
    if (!data) {
      alert("This order could not be found or is no longer available.");
      return false;
    }

    return true;
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!(await persistOrderStatus(orderId, "pending"))) return;

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "pending" } : o)),
    );
    alert(`Order #${orderId} accepted into execution pipeline!`);
  };

  const handleDeclineOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    alert(`Order #${orderId} rejected and removed from queue.`);
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"],
  ) => {
    if (!(await persistOrderStatus(orderId, newStatus))) return;

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
  };

  const sendStudentAlert = (order: Order) => {
    alert(
      `🛎️ ALERT DISPATCHED:\n\nHey ${order.student}, your food from "${vendor.standName}" is cooked and hot! Please come collect your order reference #${order.id}.`,
    );
  };

  const handleAddNewMeal = async () => {
    const mealName = newMealName.trim();
    const mealPrice = Number(newMealPrice);

    if (
      !mealName ||
      !newMealPrice.trim() ||
      !Number.isFinite(mealPrice) ||
      mealPrice <= 0
    ) {
      alert("ERROR: Meal Name and Price are mandatory.");
      return;
    }

    setIsSavingMeal(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        alert(
          authError?.message ||
            "Please sign in as a vendor before adding meals.",
        );
        return;
      }

      const { error: profileError } = await supabase
        .from("vendor_details")
        .upsert({
          id: user.id,
          stand_name: vendor.standName,
          contact_phone: vendor.contactPhone,
          working_hours: vendor.workingHours,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        alert(`Could not prepare your vendor profile: ${profileError.message}`);
        return;
      }

      // ✅ Dynamic ingredient handling
      const activeIngredients = ingredients.filter((i) => i.trim() !== "");

      const { data: mealRecord, error: mealError } = await supabase
        .from("food_items")
        .insert({
          vendor_id: user.id,
          name: mealName,
          price: mealPrice,
          description: activeIngredients.join(", "), // store as comma-separated string
          is_available: true,
        })
        .select("id, name, price, description")
        .single();

      if (mealError || !mealRecord) {
        alert(
          `Could not save meal: ${mealError?.message || "No meal record was returned."}`,
        );
        return;
      }

      const createdMeal: CustomFoodItem = {
        id: mealRecord.id,
        name: mealRecord.name,
        price: Number(mealRecord.price).toFixed(2),
        imageUrl: newMealImage.trim(),
        ingredients: mealRecord.description
          ? mealRecord.description.split(",")
          : [],
      };

      setVendorMeals((prev) => [createdMeal, ...prev]);
      setVendorMealsError("");
      alert(`${createdMeal.name} added to your storefront menu.`);

      // ✅ Reset form
      setNewMealName("");
      setNewMealPrice("");
      setNewMealImage("");
      setIngredients([""]); // reset to one empty field
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error saving meal.";
      alert(`Could not save meal: ${message}`);
    } finally {
      setIsSavingMeal(false);
    }
  };

  const handleSaveConfigurations = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("vendor_details").upsert({
        id: user.id,
        stand_name: vendor.standName,
        contact_phone: vendor.contactPhone,
        working_hours: vendor.workingHours,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        alert(`DB SAVE ERROR: ${error.message.toUpperCase()}`);
        return;
      }

      alert(
        "Configurations successfully synchronized live with your custom database!",
      );
    } catch (err) {
      alert("Network exception saving store records.");
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
          Synchronizing Store Profile Data...
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
          <Text style={styles.welcomeGreeting}>
            Welcome, {getFirstName(vendor.name)}!
          </Text>
          <Text style={styles.portalTag}>CAMPUS FOOD VENDOR NETWORK</Text>
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
                activeModule === "orders" && styles.drawerItemActive,
              ]}
              onPress={() => {
                setActiveModule("orders");
                setIsMenuOpen(false);
              }}
            >
              <Text
                style={[
                  styles.drawerItemText,
                  activeModule === "orders" && styles.drawerItemTextActive,
                ]}
              >
                📦 Order Management System
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.drawerItemButton,
                activeModule === "meals" && styles.drawerItemActive,
              ]}
              onPress={() => {
                setActiveModule("meals");
                setIsMenuOpen(false);
              }}
            >
              <Text
                style={[
                  styles.drawerItemText,
                  activeModule === "meals" && styles.drawerItemTextActive,
                ]}
              >
                🍔 Manage Meals Menu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.drawerItemButton,
                activeModule === "setup" && styles.drawerItemActive,
              ]}
              onPress={() => {
                setActiveModule("setup");
                setIsMenuOpen(false);
              }}
            >
              <Text
                style={[
                  styles.drawerItemText,
                  activeModule === "setup" && styles.drawerItemTextActive,
                ]}
              >
                ⚙️ Account Setup Gate
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
          contentContainerStyle={{ padding: 16 }}
        >
          {/* OPTION VIEW 1: ACCOUNT SETUP GATE MODULE */}
          {activeModule === "setup" && (
            <View style={styles.cardModule}>
              <Text style={styles.sectionTitle}>Account Setup Gate</Text>
              <Text style={styles.sectionSubtitle}>
                Maintain store operational metadata records below.
              </Text>

              <Text style={styles.inputLabel}>
                CAMPUS STAND LOCATION / PLACEMENT NAME
              </Text>
              <TextInput
                style={styles.inputField}
                value={vendor.standName}
                onChangeText={(text) =>
                  setVendor({ ...vendor, standName: text })
                }
                placeholder="e.g. Soshanguve South Cafeteria Block L"
                placeholderTextColor="#A0AEC0"
              />

              <Text style={styles.inputLabel}>
                STORE SERVICE CONTACT PHONE NUMBER
              </Text>
              <TextInput
                style={styles.inputField}
                value={vendor.contactPhone}
                onChangeText={(text) =>
                  setVendor({ ...vendor, contactPhone: text })
                }
                keyboardType="phone-pad"
                placeholder="e.g. +27 12 382 9000"
                placeholderTextColor="#A0AEC0"
              />

              <Text style={styles.inputLabel}>
                DAILY OPERATIONAL WORKING HOURS CYCLE
              </Text>
              <TextInput
                style={styles.inputField}
                value={vendor.workingHours}
                onChangeText={(text) =>
                  setVendor({ ...vendor, workingHours: text })
                }
                placeholder="e.g. 08:00 AM - 05:00 PM"
                placeholderTextColor="#A0AEC0"
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveConfigurations}
              >
                <Text style={styles.saveButtonText}>SAVE CONFIGURATIONS</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* OPTION VIEW 3: NEW MEALS CREATION MANAGEMENT MODULE */}
          {activeModule === "meals" && (
            <View style={styles.cardModule}>
              <Text style={styles.sectionTitle}>Manage Meals Menu</Text>
              <Text style={styles.sectionSubtitle}>
                Create and deploy tailored campus dishes live to student
                dashboards.
              </Text>

              <Text style={styles.inputLabel}>
                MEAL CLASSIFICATION / ITEM NAME
              </Text>
              <TextInput
                style={styles.inputField}
                value={newMealName}
                onChangeText={setNewMealName}
                placeholder="e.g. Special Deluxe Kota"
                placeholderTextColor="#A0AEC0"
              />

              <Text style={styles.inputLabel}>
                PRICE SCHEDULING BASE VALUE (ZAR)
              </Text>
              <TextInput
                style={styles.inputField}
                value={newMealPrice}
                onChangeText={setNewMealPrice}
                keyboardType="numeric"
                placeholder="e.g. 45.00"
                placeholderTextColor="#A0AEC0"
              />

              <Text style={styles.inputLabel}>
                FOOD IMAGE DESCRIPTOR REFERENCE WEB LINK URL
              </Text>
              <TextInput
                style={styles.inputField}
                value={newMealImage}
                onChangeText={setNewMealImage}
                placeholder="e.g. https://example.com"
                placeholderTextColor="#A0AEC0"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>
                ASSIGN SPECIFIC INGREDIENTS COMBO BLOCK
              </Text>
              <View style={styles.ingredientsInputContainer}>
                {ingredients.map((ingredient, index) => (
                  <TextInput
                    key={index}
                    style={styles.inputField}
                    value={ingredient}
                    onChangeText={(text) => {
                      const newIngredients = [...ingredients];
                      newIngredients[index] = text;
                      setIngredients(newIngredients);
                    }}
                    placeholder={`Ingredient ${index + 1}`}
                    placeholderTextColor="#A0AEC0"
                  />
                ))}

                <TouchableOpacity
                  onPress={() => setIngredients([...ingredients, ""])}
                  style={styles.addButton}
                >
                  <Text style={styles.addButtonText}>+ Add Ingredient</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddNewMeal}
                disabled={isSavingMeal}
              >
                <Text style={styles.saveButtonText}>
                  {isSavingMeal
                    ? "SAVING MEAL..."
                    : "ADD MEAL TO MENU STOREFRONT"}
                </Text>
              </TouchableOpacity>

              <Text style={[styles.moduleGroupHeading, { marginTop: 25 }]}>
                📜 Currently Deployed Menu Items
              </Text>
              {vendorMealsError ? (
                <Text style={styles.emptyStateMessageText}>
                  Could not load saved meals: {vendorMealsError}
                </Text>
              ) : vendorMeals.length === 0 ? (
                <Text style={styles.emptyStateMessageText}>
                  No unique foods deployed yet. Add one using the portal tools
                  above.
                </Text>
              ) : (
                vendorMeals.map((meal) => (
                  <View key={meal.id} style={styles.mealDisplayCard}>
                    <View style={styles.mealInfoSection}>
                      <Text style={styles.mealDisplayNameText}>
                        {meal.name}
                      </Text>
                      <Text style={styles.mealDisplayPriceText}>
                        R{meal.price}
                      </Text>
                      <Text style={styles.ingredientsListTag}>
                        Ingredients:{" "}
                        {meal.ingredients.length > 0
                          ? meal.ingredients.join(", ")
                          : "Plain Item"}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* OPTION VIEW 2: ORDER MANAGEMENT SYSTEM MODULE */}
          {activeModule === "orders" && (
            <View>
              {ordersError ? (
                <Text style={styles.emptyStateMessageText}>
                  Could not load orders: {ordersError}
                </Text>
              ) : null}

              {/* SUB-SECTION A: NEWLY INCOMING SYSTEM ORDERS */}
              <Text style={styles.moduleGroupHeading}>
                🆕 Newly Made Orders Queue
              </Text>
              {orders.filter((o) => o.status === "new").length === 0 ? (
                <Text style={styles.emptyStateMessageText}>
                  No new incoming orders at present.
                </Text>
              ) : (
                orders
                  .filter((o) => o.status === "new")
                  .map((order) => (
                    <View
                      key={order.id}
                      style={[styles.orderCard, styles.newOrderBorder]}
                    >
                      <View style={styles.cardHeaderRow}>
                        <Text style={styles.orderIdText}>
                          Order #{order.id}
                        </Text>
                        <Text style={styles.priceTagText}>{order.total}</Text>
                      </View>
                      <Text style={styles.orderDetailsText}>
                        <Text style={{ fontWeight: "700" }}>
                          {order.student}
                        </Text>
                        : {order.items}
                      </Text>

                      <View style={styles.actionButtonsRowLayout}>
                        <TouchableOpacity
                          style={styles.acceptButton}
                          onPress={() => handleAcceptOrder(order.id)}
                        >
                          <Text style={styles.acceptButtonText}>
                            ACCEPT ORDER
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.declineButton}
                          onPress={() => handleDeclineOrder(order.id)}
                        >
                          <Text style={styles.declineButtonText}>DECLINE</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
              )}

              {/* SUB-SECTION B: ACCEPTED ACTIVE ORDERS WORKSPACE MANAGEMENT ROW */}
              <Text style={[styles.moduleGroupHeading, { marginTop: 24 }]}>
                🍳 Accepted Working Orders
              </Text>
              {orders.filter((o) => o.status !== "new").length === 0 ? (
                <Text style={styles.emptyStateMessageText}>
                  No active orders currently under processing cycle loops.
                </Text>
              ) : (
                orders
                  .filter((o) => o.status !== "new")
                  .map((order) => (
                    <View
                      key={order.id}
                      style={[
                        styles.orderCard,
                        order.status === "ready" && styles.readyOrderCardBorder,
                      ]}
                    >
                      <View style={styles.cardHeaderRow}>
                        <Text style={styles.orderIdText}>
                          Order #{order.id}
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                order.status === "ready"
                                  ? "#10B981"
                                  : order.status === "preparing"
                                    ? "#3182CE"
                                    : "#ED8936",
                            },
                          ]}
                        >
                          <Text style={styles.statusBadgeText}>
                            {order.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.orderDetailsText}>
                        <Text style={{ fontWeight: "700" }}>
                          {order.student}
                        </Text>
                        : {order.items}
                      </Text>

                      <Text style={styles.stateMutationLabel}>
                        MUTATE STATE PROGRESSION LAYER:
                      </Text>
                      <View style={styles.statusTogglesRowButtonGroup}>
                        {(["pending", "preparing", "ready"] as const).map(
                          (status) => (
                            <TouchableOpacity
                              key={status}
                              onPress={() =>
                                handleStatusChange(order.id, status)
                              }
                              style={[
                                styles.stateSelectionItemButton,
                                order.status === status &&
                                  styles.stateSelectionItemButtonActive,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.stateSelectionItemButtonText,
                                  order.status === status &&
                                    styles.stateSelectionItemButtonTextActive,
                                ]}
                              >
                                {status.toUpperCase()}
                              </Text>
                            </TouchableOpacity>
                          ),
                        )}
                      </View>

                      {/* CONTEXT DISPATCH TRIGGER GATES: SEND NOTIFICATION ALERTS TO STUDENTS WHEN FOOD IS READY */}
                      {order.status === "ready" && (
                        <TouchableOpacity
                          style={styles.alertStudentButton}
                          onPress={() => sendStudentAlert(order)}
                        >
                          <Text style={styles.alertStudentButtonText}>
                            📢 ALERT STUDENT FOR COLLECTION
                          </Text>
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
  container: { flex: 1, backgroundColor: "#F1F5F9" },
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
  workspace: { flex: 1 },
  cardModule: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0B2977",
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 18,
  },
  moduleGroupHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyStateMessageText: {
    color: "#64748B",
    fontStyle: "italic",
    paddingVertical: 8,
    fontSize: 13,
    paddingLeft: 4,
  },
  inputLabel: {
    color: "#334155",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  inputField: {
    width: "100%",
    height: 46,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 14,
  },
  saveButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#FFCC00",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#0B2977",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  newOrderBorder: { borderLeftWidth: 5, borderLeftColor: "#ED8936" },
  readyOrderCardBorder: {
    borderLeftWidth: 5,
    borderLeftColor: "#10B981",
    borderColor: "#10B981",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  orderIdText: { fontWeight: "900", fontSize: 15, color: "#0B2977" },
  priceTagText: { color: "#10B981", fontWeight: "900", fontSize: 14 },
  orderDetailsText: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
    marginBottom: 10,
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  statusBadgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },
  actionButtonsRowLayout: { flexDirection: "row", gap: 8 },
  acceptButton: {
    flex: 2,
    height: 38,
    backgroundColor: "#0B2977",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#FFCC00",
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  declineButton: {
    flex: 1,
    height: 38,
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  declineButtonText: { color: "#4A5568", fontWeight: "800", fontSize: 11 },
  stateMutationLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  statusTogglesRowButtonGroup: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },
  stateSelectionItemButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
  },
  stateSelectionItemButtonActive: { backgroundColor: "#0B2977" },
  stateSelectionItemButtonText: {
    color: "#4A5568",
    fontSize: 10,
    fontWeight: "800",
  },
  stateSelectionItemButtonTextActive: { color: "#FFCC00" },
  alertStudentButton: {
    backgroundColor: "#10B981",
    height: 42,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#059669",
  },
  alertStudentButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  ingredientsCheckboxContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 10,
  },
  checkboxOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  checkboxOptionActive: { backgroundColor: "#0B2977", borderColor: "#0B2977" },
  checkboxText: { color: "#4A5568", fontSize: 12, fontWeight: "700" },
  checkboxTextActive: { color: "#FFCC00" },
  mealDisplayCard: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  mealInfoSection: { flex: 1 },
  mealDisplayNameText: { fontSize: 15, fontWeight: "800", color: "#1E293B" },
  mealDisplayPriceText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0B2977",
    marginVertical: 2,
  },
  ingredientsInputContainer: {
    marginTop: 10,
  },

  addButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#0B2977",
    borderRadius: 8,
    alignItems: "center",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  ingredientsListTag: { fontSize: 12, color: "#64748B", fontWeight: "600" },
});
