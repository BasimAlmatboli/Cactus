# Cactus System Documentation

## 🏢 **System Overview**

### What is Cactus System?

**Cactus System** is an e-commerce order management platform designed for **two-partner businesses**. It handles order processing, profit sharing between partners (Yassir & Basim), expense tracking, and integrates with Salla (Saudi e-commerce platform) for automated order imports.

**Key Features:**
- 📦 Manual order creation with real-time calculations
- 🔄 Automated Salla CSV import
- 💰 Profit sharing between two business partners
- 📊 Financial reports and expense tracking
- ⚙️ Dynamic payment & shipping method configuration

---

### 🎯 Business Purpose

The system solves the problem of **fair profit distribution** in a two-owner business:

1. **Different products have different ownership** - Some products belong to Yassir, some to Basim
2. **Shared expenses** - Shipping & payment fees are split proportionally based on revenue
3. **Complex calculations** - Each order requires calculating each partner's share
4. **Multiple sales channels** - Manual orders + Salla imports

**Example:**
```
Order Total: 200 SAR
- Product A (Yassir's): 150 SAR
- Product B (Basim's): 50 SAR

Shipping Fee: 15 SAR shared proportionally
- Yassir pays: 11.25 SAR (75%)
- Basim pays: 3.75 SAR (25%)

Net Profits:
- Yassir: 138.75 SAR
- Basim: 46.25 SAR
```

---

### 📱 **Application Pages**

#### **1. Calculator** (`/calculator`) - Primary Order Entry
- **Purpose:** Manually create and calculate orders
- **Features:**
  - Product selection with quantity
  - Shipping method selection
  - Payment method selection (MADA, Visa, Tamara, etc.)
  - Discount application (percentage or fixed)
  - Real-time calculation of totals, fees, and profit shares
  - Save orders to database
  - Edit existing orders

#### **2. Salla Import** (`/salla-import`) - Bulk Order Import
- **Purpose:** Import orders from Salla e-commerce platform via CSV
- **Features:**
  - Upload Salla CSV export file
  - Automatic product/shipping/payment mapping
  - Preview orders before importing
  - Bulk import with validation
  - Mapping management for Salla → System entities

#### **3. Orders** (`/orders`) - Order History
- **Purpose:** View and manage all orders
- **Features:**
  - List all orders with key details
  - Search and filter orders
  - View order details
  - Edit existing orders
  - Export order data

#### **4. Reports** (`/reports`) - Financial Analysis
- **Purpose:** View profit sharing and financial reports
- **Features:**
  - Partner profit breakdown (Yassir vs Basim)
  - Date range filtering
  - Revenue and expense summaries
  - Profit share visualizations

#### **5. Expenses** (`/expenses`) - Cost Tracking
- **Purpose:** Track business expenses
- **Features:**
  - Add expenses with category, amount, date
  - View expense history
  - Expense categorization

#### **6. Settings** (`/settings`) - System Configuration
- **Purpose:** Configure system parameters
- **Features:**
  - Payment methods management (add, edit, fees, customer fees)
  - Shipping methods management
  - Free shipping threshold
  - Salla mapping management
  - System settings

---

### 🗄️ **Database Structure**

The system uses **Supabase** (PostgreSQL) with **12 tables**:

#### **Core Transaction Tables**

1. **`orders`** - Main orders table
   - `id`, `order_number`, `customer_name`, `date`
   - `items` (JSONB array of products)
   - `shipping_method`, `payment_method`
   - `subtotal`, `shipping_cost`, `payment_fees`
   - `discount`, `total`, `net_profit`
   - `is_free_shipping`, `applied_offer`

2. **`expenses`** - Business expenses
   - `id`, `date`, `category`, `description`, `amount`

#### **Product & Inventory Tables**

3. **`products`** - Product catalog
   - `id`, `name`, `sku`, `cost`, `selling_price`
   - `owner` (which partner owns this product)
   - `category`, `is_active`, `stock_quantity`

4. **`product_profit_shares`** - Partner ownership per product
   - `product_id`, `partner_id`, `share_percentage`
   - Enables flexible profit sharing models

#### **Configuration Tables**

5. **`payment_methods`** - Payment gateway configurations
   - `id`, `name`, `fee_percentage`, `fee_fixed`
   - `customer_fee` (e.g., COD fee charged to customer)
   - `tax_rate`, `display_order`, `is_active`

6. **`shipping_methods`** - Shipping options
   - `id`, `name`, `cost`, `is_active`

7. **`system_settings`** - Global settings
   - `key`, `value`, `description`
   - Example: `free_shipping_threshold` = 100

8. **`partners`** - Business partners
   - `id`, `name`, `share_percentage`
   - Currently: Yassir & Basim

9. **`offers`** - Promotional offers (legacy, may be removed)
   - Discount offers and promotions

#### **Salla Integration Tables**

10. **`salla_product_mappings`** - Map Salla products to system products
    - `salla_product_name`, `salla_sku`
    - `system_product_id`

11. **`salla_shipping_mappings`** - Map Salla shipping to system methods
    - `salla_shipping_name`
    - `system_shipping_method_id`

12. **`salla_payment_mappings`** - Map Salla payment to system methods
    - `salla_payment_name`
    - `system_payment_method_id`

---

### 🏗️ **System Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                       │
├─────────────────────────────────────────────────────────────┤
│  Pages:                                                      │
│  - Calculator  - Orders  - Reports  - Settings              │
│  - SallaImport - Expenses                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              BUSINESS LOGIC LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Centralized Functions: /utils/orderCalculations/          │
│  - calculateCompleteOrder() ← SINGLE SOURCE OF TRUTH        │
│  - calculateSubtotal(), calculateDiscount()                 │
│  - calculateCustomerTotal(), calculatePaymentFees()         │
│                                                              │
│  Hooks:                                                      │
│  - useOrder() - Order state management                      │
│  - useFreeShippingThreshold() - Settings                    │
│                                                              │
│  Services:                                                   │
│  - orderService - Save/fetch orders                         │
│  - paymentMethodService - Manage payment methods            │
│  - sallaMappingService - Salla integration                  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  DATABASE (Supabase/PostgreSQL)             │
├─────────────────────────────────────────────────────────────┤
│  12 Tables storing:                                          │
│  - Orders, Products, Partners                                │
│  - Payment Methods, Shipping Methods                         │
│  - Expenses, Settings                                        │
│  - Salla Mappings (product/shipping/payment)                │
└──────────────────────────────────────────────────────────────┘
```

---

### 🔄 **Data Flow**

#### **Manual Order Creation (Calculator)**
```
1. User selects products, shipping, payment
     ↓
2. useOrder hook watches for changes
     ↓
3. Calls calculateCompleteOrder()
     ↓
4. Returns calculated values (total, fees, profit)
     ↓
5. Display updates in real-time
     ↓
6. User clicks "Save Order"
     ↓
7. orderService.saveOrder() → Database
```

#### **Salla Import**
```
1. User uploads Salla CSV file
     ↓
2. Parse CSV → Extract orders
     ↓
3. Map Salla products/shipping/payment to system entities
     ↓
4. For each order:
    - Calls calculateCompleteOrder() (SAME FUNCTION!)
    - Creates order object
    - Saves to database
     ↓
5. Display import results
```

---

### 💡 **Key Design Principles**

**1. Centralized Business Logic**
- All calculations in `/utils/orderCalculations/`
- One function used everywhere
- Guaranteed consistency

**2. Separation of Concerns**
- UI Pages → Display only
- Hooks → State management
- Utils → Business logic
- Services → Data access

**3. Single Source of Truth**
- `calculateCompleteOrder()` is called by:
  - Calculator page
  - Salla import
  - Order edits
- **Same inputs → Same outputs, always!**

**4. Database-Driven Configuration**
- Payment methods stored in DB, not hardcoded
- Shipping methods configurable
- Settings managed via UI

---

## 📖 **Order Calculations Module**

*The following section documents the centralized calculation functions...*

---

## 📚 Overview

This directory contains **all business logic** for order calculations in the Cactus System. Every calculation is centralized here to ensure consistency across the entire application.

### 🎯 Core Principle

**One Function, One Responsibility, Used Everywhere**

Same inputs → Same outputs → No matter where you call it from!

---

## 🏗️ Architecture

```
src/utils/orderCalculations/
├── index.ts              # Export all functions (use this!)
├── subtotal.ts           # Calculate order subtotal
├── discount.ts           # Calculate discount amount
├── shipping.ts           # Determine free shipping & actual cost
├── customerTotal.ts      # Calculate what customer pays
├── fees.ts               # Calculate payment gateway fees
└── completeOrder.ts      # Orchestrator (MAIN FUNCTION)
```

---

## 🚀 Quick Start

### **Option 1: Use Complete Calculation (Recommended)**

For **all** order calculations, use this single function:

```typescript
import { calculateCompleteOrder } from '@/utils/orderCalculations';

const result = await calculateCompleteOrder({
  orderItems: [
    { product: { sellingPrice: 50, ... }, quantity: 2 },
    { product: { sellingPrice: 30, ... }, quantity: 1 }
  ],
  shippingMethod: { cost: 15, ... },
  paymentMethod: { customer_fee: 10, ... },
  discount: { type: 'percentage', value: 10 }, // or null
  freeShippingThreshold: 100
});

// Use the results
console.log(result.subtotal);           // 130 SAR
console.log(result.discountAmount);     // 13 SAR (10%)
console.log(result.isFreeShipping);     // true (117 >= 100)
console.log(result.actualShippingCost); // 0 SAR (free!)
console.log(result.customerFee);        // 10 SAR (COD fee)
console.log(result.customerTotal);      // 127 SAR ← What customer pays
console.log(result.paymentFees);        // 2.61 SAR ← What you pay to gateway
console.log(result.netProfit);          // [calculated profit]
```

### **Option 2: Use Individual Functions**

For specific calculations only:

```typescript
import { 
  calculateSubtotal,
  calculateDiscountAmount,
  determineIsFreeShipping 
} from '@/utils/orderCalculations';

const subtotal = calculateSubtotal(orderItems);
const discount = calculateDiscountAmount(subtotal, discountObj);
const isFree = determineIsFreeShipping(subtotal, discount, 100);
```

---

## 📖 Function Reference

### **1. calculateCompleteOrder()** ⭐ MAIN FUNCTION

**Purpose:** Single source of truth for ALL order calculations

**When to use:** Calculator page, Import flow, anywhere you need complete order data

```typescript
interface OrderCalculationInputs {
  orderItems: OrderItem[];
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  discount: Discount | null;
  freeShippingThreshold: number;
}

interface OrderCalculationResult {
  subtotal: number;
  discountAmount: number;
  isFreeShipping: boolean;
  actualShippingCost: number;
  customerFee: number;
  customerTotal: number;      // ← What customer pays
  paymentFees: number;         // ← What you pay
  netProfit: number;
}
```

**Example:**
```typescript
const result = await calculateCompleteOrder({
  orderItems,
  shippingMethod,
  paymentMethod,
  discount: null,
  freeShippingThreshold: 100
});

// Build your order object
const order = {
  subtotal: result.subtotal,
  total: result.customerTotal,
  paymentFees: result.paymentFees,
  netProfit: result.netProfit,
  isFreeShipping: result.isFreeShipping,
  // ... other order info
};
```

---

### **2. calculateSubtotal()**

**Purpose:** Sum all product prices × quantities

```typescript
function calculateSubtotal(items: OrderItem[]): number
```

**Example:**
```typescript
const items = [
  { product: { sellingPrice: 50 }, quantity: 2 },  // 100 SAR
  { product: { sellingPrice: 30 }, quantity: 1 }   //  30 SAR
];

const subtotal = calculateSubtotal(items); // 130 SAR
```

---

### **3. calculateDiscountAmount()**

**Purpose:** Calculate discount (percentage or fixed)

```typescript
function calculateDiscountAmount(
  subtotal: number,
  discount: Discount | null
): number
```

**Examples:**
```typescript
// Percentage discount
const discount1 = calculateDiscountAmount(130, { type: 'percentage', value: 10 });
// Result: 13 SAR (130 × 10%)

// Fixed discount
const discount2 = calculateDiscountAmount(130, { type: 'fixed', value: 20 });
// Result: 20 SAR

// No discount
const discount3 = calculateDiscountAmount(130, null);
// Result: 0 SAR
```

---

### **4. determineIsFreeShipping()**

**Purpose:** Check if order qualifies for free shipping

```typescript
function determineIsFreeShipping(
  subtotal: number,
  discountAmount: number,
  freeShippingThreshold: number
): boolean
```

**Formula:** `(subtotal - discount) >= threshold`

**Example:**
```typescript
const isFree = determineIsFreeShipping(130, 13, 100);
// Calculation: (130 - 13) = 117 >= 100
// Result: true (free shipping!) ✅
```

---

### **5. calculateActualShippingCost()**

**Purpose:** Get shipping cost to charge customer

```typescript
function calculateActualShippingCost(
  shippingMethodCost: number,
  isFreeShipping: boolean
): number
```

**Example:**
```typescript
const cost1 = calculateActualShippingCost(15, true);  // 0 SAR (free)
const cost2 = calculateActualShippingCost(15, false); // 15 SAR (paid)
```

---

### **6. calculateCustomerTotal()** ⭐ IMPORTANT

**Purpose:** Calculate final amount customer must pay

```typescript
function calculateCustomerTotal(params: {
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  customerFee: number;
}): number
```

**Formula:** `subtotal + shipping - discount + customerFee`

**Example:**
```typescript
const total = calculateCustomerTotal({
  subtotal: 130,
  shippingCost: 0,      // Free shipping
  discountAmount: 13,   // 10% off
  customerFee: 10       // COD fee
});
// Result: 127 SAR (130 + 0 - 13 + 10)
```

**This is what appears on:**
- Calculator "Save Order" button
- Order Summary total
- Orders table
- All invoices

---

### **7. calculatePaymentFees()**

**Purpose:** Calculate gateway fees (what YOU pay, not customer)

```typescript
function calculatePaymentFees(
  paymentMethod: PaymentMethod,
  amount: number
): number
```

**Formula:** `(amount × fee% / 100 + fixedFee) × (1 + tax% / 100)`

**Example (MADA):**
```typescript
const paymentMethod = {
  fee_percentage: 1,    // 1%
  fee_fixed: 1,         // 1 SAR
  tax_rate: 15          // 15% VAT
};

const fees = calculatePaymentFees(paymentMethod, 127);
// Gateway Fee: 127 × 1% = 1.27 SAR
// Base Fees: 1.27 + 1 = 2.27 SAR
// Tax: 2.27 × 15% = 0.34 SAR
// Total: 2.61 SAR
```

---

## 💡 Usage Examples

### **Example 1: Calculator Page**

```typescript
import { calculateCompleteOrder } from '@/utils/orderCalculations';
import { useOrder } from '@/hooks/useOrder';

function Calculator() {
  const { orderItems, shippingMethod, paymentMethod, discount } = useOrder();
  
  // All calculations happen here
  const result = await calculateCompleteOrder({
    orderItems,
    shippingMethod,
    paymentMethod,
    discount,
    freeShippingThreshold: 100
  });
  
  // Display the results
  return (
    <div>
      <p>Customer Pays: {result.customerTotal} SAR</p>
      <p>You Pay Fees: {result.paymentFees} SAR</p>
    </div>
  );
}
```

---

### **Example 2: Import Flow**

```typescript
import { calculateCompleteOrder } from '@/utils/orderCalculations';

async function importOrders(sallaOrders) {
  for (const sallaOrder of sallaOrders) {
    // Convert Salla discount to our format
    const discount = sallaOrder.discount > 0
      ? { type: 'fixed', value: sallaOrder.discount }
      : null;
    
    // Same function as Calculator!
    const result = await calculateCompleteOrder({
      orderItems: mappedItems,
      shippingMethod: mappedShipping,
      paymentMethod: mappedPayment,
      discount,
      freeShippingThreshold: 100
    });
    
    // Save order with calculated values
    await saveOrder({
      ...orderInfo,
      total: result.customerTotal,
      paymentFees: result.paymentFees,
      netProfit: result.netProfit
    });
  }
}
```

---

### **Example 3: Display Only**

```typescript
// OrderSummary.tsx - Just display, don't recalculate!
function OrderSummary({ order }) {
  return (
    <div>
      <p>Subtotal: {order.subtotal} SAR</p>
      <p>Discount: -{discountAmount} SAR</p>
      <p>Shipping: {order.isFreeShipping ? 'FREE' : order.shippingCost} SAR</p>
      
      {/* ✅ Use pre-calculated total */}
      <p>Total: {order.total} SAR</p>
      
      {/* ❌ DON'T recalculate like this: */}
      {/* <p>Total: {order.subtotal + shipping - discount} SAR</p> */}
    </div>
  );
}
```

---

## 🎯 Best Practices

### ✅ **DO's**

1. **Always use `calculateCompleteOrder()`** for full calculations
2. **Trust the result** - Don't recalculate in UI
3. **Pass complete objects** - Don't cherry-pick properties
4. **Use for consistency** - Same function everywhere

```typescript
// ✅ GOOD - Complete calculation
const result = await calculateCompleteOrder({ ... });
setOrder({ total: result.customerTotal });

// ✅ GOOD - Display pre-calculated value
<span>{order.total} SAR</span>
```

### ❌ **DON'Ts**

1. **Don't inline calculations** - Use the functions
2. **Don't recalculate** - Use order.total
3. **Don't duplicate logic** - Import from this module
4. **Don't modify** - Create new functions instead

```typescript
// ❌ BAD - Inline calculation
const total = subtotal + shipping - discount;

// ❌ BAD - Recalculating in display
const calculatedTotal = order.subtotal + order.shippingCost;

// ❌ BAD - Duplicating logic
function myCustomCalculation() {
  return items.reduce(...); // Use calculateSubtotal()!
}
```

---

## 🧪 Testing

Every function is pure and easy to test:

```typescript
import { calculateCustomerTotal } from '@/utils/orderCalculations';

test('calculates customer total correctly', () => {
  const result = calculateCustomerTotal({
    subtotal: 130,
    shippingCost: 0,
    discountAmount: 13,
    customerFee: 10
  });
  
  expect(result).toBe(127); // 130 + 0 - 13 + 10
});
```

---

## 🔄 Adding New Calculations

**Need to add a new calculation? Follow these steps:**

1. **Create new function file** (e.g., `expressFee.ts`)
```typescript
export function calculateExpressFee(isExpress: boolean): number {
  return isExpress ? 20 : 0;
}
```

2. **Export from `index.ts`**
```typescript
export { calculateExpressFee } from './expressFee';
```

3. **Update `completeOrder.ts`** orchestrator
```typescript
export async function calculateCompleteOrder(inputs) {
  // ... existing calculations
  
  const expressFee = calculateExpressFee(inputs.isExpress);
  
  const customerTotal = calculateCustomerTotal({
    subtotal,
    shippingCost,
    discountAmount,
    customerFee: customerFee + expressFee  // Add to total
  });
  
  return {
    // ... existing results
    expressFee
  };
}
```

4. **Done!** All pages automatically use the new logic

---

## 📊 Calculation Flow

```
Order Items
    ↓
1. Calculate Subtotal (sum of all products)
    ↓
2. Calculate Discount (percentage or fixed)
    ↓
3. Check Free Shipping (subtotal - discount >= threshold?)
    ↓
4. Determine Shipping Cost (free = 0, paid = method cost)
    ↓
5. Get Customer Fee (e.g., 10 SAR COD fee)
    ↓
6. Calculate Customer Total ← What customer pays
    ↓
7. Calculate Payment Fees ← What you pay to gateway
    ↓
8. Calculate Profit Sharing
    ↓
RESULT: Complete order data
```

---

## 🎓 Real-World Example

**Scenario:** Customer orders 2 hoodies + 1 pants with COD

```typescript
const result = await calculateCompleteOrder({
  orderItems: [
    { product: { sellingPrice: 50 }, quantity: 2 },  // 2 hoodies
    { product: { sellingPrice: 30 }, quantity: 1 }   // 1 pants
  ],
  shippingMethod: { cost: 15 },
  paymentMethod: { 
    name: 'MADA',
    customer_fee: 10,        // COD fee charged to customer
    fee_percentage: 1,       // Gateway fee you pay
    fee_fixed: 1,
    tax_rate: 15
  },
  discount: { type: 'percentage', value: 10 },
  freeShippingThreshold: 100
});

// Results:
result.subtotal           // 130 SAR (50×2 + 30×1)
result.discountAmount     // 13 SAR (10% of 130)
result.isFreeShipping     // true (117 >= 100)
result.actualShippingCost // 0 SAR (free!)
result.customerFee        // 10 SAR (COD fee)
result.customerTotal      // 127 SAR (130 + 0 - 13 + 10) ← Customer pays this
result.paymentFees        // 2.61 SAR (you pay this to MADA)
```

**Customer Invoice:**
```
Subtotal:        130.00 SAR
Discount (10%):  -13.00 SAR
Shipping:         FREE!
COD Fee:         +10.00 SAR
─────────────────────────
Total:           127.00 SAR ← Customer pays
```

**Your Costs:**
```
Payment Gateway Fee: 2.61 SAR
```

---

## 📝 Summary

✅ **One function does everything:** `calculateCompleteOrder()`  
✅ **Same inputs → Same outputs:** Guaranteed consistency  
✅ **Used everywhere:** Calculator, Import, Display  
✅ **Easy to test:** Pure functions  
✅ **Easy to maintain:** Change once, applies everywhere  

**Remember:** These functions are the **SINGLE SOURCE OF TRUTH** for all order calculations in the system!

---

## 🤝 Need Help?

- Check function comments for examples
- Review `completeOrder.ts` for the full flow
- Look at existing usage in `useOrder.ts` or `SallaImportFlow.tsx`
