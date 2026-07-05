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
result.discount Amount          // 13 SAR (10% of 130)
result.isFreeShipping        // true ((130-13) = 117 >= 100)  
result.actualShippingCost    // 0 SAR (free!)
result.customerFee           // 10 SAR (COD fee)
result.customerTotal         // 127 SAR ← Invoice amount
result.paymentFees           // 2.61 SAR ← What YOU pay
```

**Customer Invoice:**
```
Subtotal:        130 SAR
Discount (10%): - 13 SAR
Shipping:          FREE
COD Fee:        + 10 SAR
━━━━━━━━━━━━━━━━━━━━━━
TOTAL:           127 SAR ✅
```

**Your Costs:**
```
Payment Fees: 2.61 SAR (MADA 1% + 1 SAR + 15% VAT)
```

---

## 📊 **Report Calculations Module**

### 🎯 Overview

Similar to order calculations, **all report metrics** are centralized in `/utils/reportCalculations/`. This ensures consistency across all financial reports.

### 🏗️ Architecture

```
src/utils/reportCalculations/
├── index.ts              # Export all functions
├── types.ts              # TypeScript interfaces  
├── complete.ts           # Orchestrator - calculateAllReportMetrics()
├── volume.ts             # Order volume metrics
├── revenue.ts            # Revenue calculations
├── costs.ts              # Cost & fee breakdowns
├── profit.ts             # Profit metrics
├── profitSharing.ts      # Partner profit shares
├── earnings.ts           # Partner earnings
├── expenses.ts           # Expense calculations
└── partnerNetProfit.ts   # Final distributions
```

### 🚀 Quick Start

**Use the single orchestrator function:**

```typescript
import { calculateAllReportMetrics } from '@/utils/reportCalculations';

const metrics = await calculateAllReportMetrics({
  orders: ordersArray,
  expenses: expensesArray
});

// Access all metrics from one object
console.log(metrics.totalRevenue);          // 17604.08
console.log(metrics.totalExpenses);         // 3690.85
console.log(metrics.grossProfit);           // 13551.08
console.log(metrics.netProfit);             // 10856.32
console.log(metrics.earnings.basimTotalEarnings);
console.log(metrics.expenses.yassirExpenses);
console.log(metrics.partnerNetProfit.basimNetProfit);
```

### 📊 Complete Metric Types

```typescript
interface ReportMetrics {
  // Volume
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;

  // Costs
  totalProductCosts: number;
  totalShippingFees: number;
  totalPaymentFees: number;
  totalFees: number;

  // Profit
  grossProfit: number;
  netProfit: number;
  grossProfitMargin: number;
  netProfitMargin: number;
  grossProfitPerOrder: number;
  netProfitPerOrder: number;

  // Partner Shares
  profitShares: PartnerProfitShares;
  earnings: PartnerEarnings;
  expenses: PartnerExpenses;
  partnerNetProfit: PartnerNetProfit;

  // Fee Analysis
  shippingFeeData: ShippingFeeData;
  paymentFeeData: PaymentFeeData;

  // Additional
  marketingExpenses: number;
  productCostPercent: number;
  feeImpactPercent: number;
}
```

### ✅ Best Practices

```typescript
// ✅ GOOD - Calculate once, use everywhere
const metrics = await calculateAllReportMetrics({ orders, expenses });
<NetProfitReport metrics={metrics} />
<BusinessMetricsReport metrics={metrics} />
<PartnerPayoutsReport metrics={metrics} />

// ✅ GOOD - Display pre-calculated values
<p>{metrics.totalExpenses.toFixed(2)} SAR</p>

// ❌ BAD - Don't recalculate in components
const total = expenses.reduce((sum, e) => sum + e.amount, 0);

// ❌ BAD - Don't duplicate calculation logic
const grossProfit = revenue - costs; // Use metrics.grossProfit!
```

---

## 🤖 **CRITICAL: AI Agent Guidelines**

> [!CAUTION]
> **FOR ANY AI DEVELOPER WORKING ON THIS PROJECT**
> 
> This section contains **MANDATORY ARCHITECTURE RULES** that must NEVER be violated.
> Violating these rules will break the entire calculation consistency across the system.

### ⚠️ **Golden Rules**

#### **Rule #1: NEVER Calculate in UI Components**

**❌ FORBIDDEN:**
```typescript
// DON'T DO THIS - Calculation in component
function OrderTotal({ items, shipping }) {
  const total = items.reduce((sum, item) => 
    sum + item.price * item.quantity, 0) + shipping;
  return <p>{total}</p>;
}

// DON'T DO THIS - Manual calculation in report
function ProfitReport({ orders }) {
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  return <p>Revenue: {revenue}</p>;
}
```

**✅ REQUIRED:**
```typescript
// DO THIS - Use centralized calculation
function OrderTotal({ orderData }) {
  return <p>{orderData.customerTotal}</p>;
}

// DO THIS - Use metrics object
function ProfitReport({ metrics }) {
  return <p>Revenue: {metrics.totalRevenue}</p>;
}
```

---

#### **Rule #2: ALWAYS Use Centralized Functions**

**FOR ORDER CALCULATIONS:**
```typescript
import { calculateCompleteOrder } from '@/utils/orderCalculations';

// ✅ ALWAYS call this for ANY order calculation
const result = await calculateCompleteOrder({
  orderItems,
  shippingMethod,
  paymentMethod,
  discount,
  freeShippingThreshold
});
```

**FOR REPORT CALCULATIONS:**
```typescript
import { calculateAllReportMetrics } from '@/utils/reportCalculations';

// ✅ ALWAYS call this for ANY report metrics
const metrics = await calculateAllReportMetrics({
  orders,
  expenses
});
```

---

#### **Rule #3: NEVER Duplicate Calculation Logic**

**❌ FORBIDDEN:**
```typescript
// Creating new calculation functions
function calculateOrderTotal(items) {
  return items.reduce(...); // DON'T!
}

function getRevenue(orders) {
  return orders.reduce(...); // DON'T!
}
```

**✅ REQUIRED:**
```typescript
// Use existing centralized functions
import { calculateCompleteOrder, calculateAllReportMetrics } 
  from '@/utils/...'
```

---

#### **Rule #4: Single Source of Truth**

**Where Calculations Live:**

| Calculation Type | Location | Function |
|-----------------|----------|----------|
| Order totals, fees, profit | `utils/orderCalculations/` | `calculateCompleteOrder()` |
| Report metrics, analytics | `utils/reportCalculations/` | `calculateAllReportMetrics()` |
| Individual order metrics | `utils/orderCalculations/` | Specific functions |
| Individual report metrics | `utils/reportCalculations/` | Specific functions |

**Usage Pattern:**
```typescript
// Calculator page
const orderData = await calculateCompleteOrder({ ... });

// Salla import
const orderData = await calculateCompleteOrder({ ... }); // SAME FUNCTION!

// Order edit
const orderData = await calculateCompleteOrder({ ... }); // SAME FUNCTION!

// Reports page
const metrics = await calculateAllReportMetrics({ ... });

// All report components
<Component metrics={metrics} /> // SAME OBJECT!
```

---

### 🎯 **Implementation Checklist**

Before adding ANY feature that involves calculations, verify:

- [ ] Am I calculating order-related values?
  - ✅ YES → Use `calculateCompleteOrder()`
  - ❌ NO → Continue

- [ ] Am I calculating report/analytics values?
  - ✅ YES → Use `calculateAllReportMetrics()`
  - ❌ NO → Continue

- [ ] Am I displaying pre-calculated values?
  - ✅ YES → Use `order.total` or `metrics.revenue` directly
  - ❌ NO → You're doing it wrong!

- [ ] Do I need a NEW calculation not in centralized modules?
  - ✅ YES → Add to appropriate module (orderCalculations or reportCalculations)
  - ❌ NO → Use existing functions

---

### 🚨 **Common Mistakes to Avoid**

#### **Mistake #1: Inline Calculations**
```typescript
// ❌ WRONG
<p>Total: {items.reduce((s, i) => s + i.price, 0)}</p>

// ✅ CORRECT
<p>Total: {orderData.customerTotal}</p>
```

#### **Mistake #2: Recalculating in Display**
```typescript
// ❌ WRONG
const displayTotal = order.subtotal - order.discount + order.shipping;

// ✅ CORRECT
const displayTotal = order.total; // Already calculated!
```

#### **Mistake #3: Creating Helper Functions**
```typescript
// ❌ WRONG - Don't create local helpers
function getTotalRevenue(orders) {
  return orders.reduce((sum, o) => sum + o.total, 0);
}

// ✅ CORRECT - Import from centralized module
import { calculateAllReportMetrics } from '@/utils/reportCalculations';
const metrics = await calculateAllReportMetrics({ orders, expenses });
const revenue = metrics.totalRevenue;
```

#### **Mistake #4: Modifying Centralized Functions**
```typescript
// ❌ WRONG - Changing how fees are calculated
export function calculatePaymentFees(method, amount) {
  // Modified logic here breaks everything!
}

// ✅ CORRECT - Extend, don't modify
export function calculateSpecialFees(method, amount) {
  const baseFees = calculatePaymentFees(method, amount);
  return baseFees + specialFee;
}
```

---

### 📋 **Adding New Calculations**

**Step-by-step process:**

1. **Identify the correct module:**
   - Order-related? → `utils/orderCalculations/`
   - Report-related? → `utils/reportCalculations/`

2. **Create new function file:**
   ```typescript
   // utils/reportCalculations/customMetric.ts
   export function calculateCustomMetric(input: InputType): number {
     // Pure function - no side effects
     return calculatedValue;
   }
   ```

3. **Export from index.ts:**
   ```typescript
   export { calculateCustomMetric } from './customMetric';
   ```

4. **Update orchestrator (if needed):**
   ```typescript
   // complete.ts or completeOrder.ts
   const customMetric = calculateCustomMetric(data);
   return {
     ...otherMetrics,
     customMetric
   };
   ```

5. **Use in components:**
   ```typescript
   const metrics = await calculateAllReportMetrics({ ... });
   <p>{metrics.customMetric}</p>
   ```

---

### ⚡ **Quick Reference**

**When you see this pattern - IT'S WRONG:**
- `orders.reduce(...)` in a component
- `expenses.filter(...).reduce(...)` in a component
- `order.subtotal + order.shipping - order.discount` manually
- New functions calculating totals/metrics locally
- `useState` for calculations

**When you see this pattern - IT'S CORRECT:**
- `import { calculateCompleteOrder } from '@/utils/orderCalculations'`
- `import { calculateAllReportMetrics } from '@/utils/reportCalculations'`
- `<Component data={calculatedData} />` (passing results)
- `{orderData.customerTotal}` (displaying pre-calculated)
- `{metrics.totalRevenue}` (displaying from metrics)

---

### 💡 **Why This Matters**

**Problem Without Centralization:**
- Calculate order total in Calculator: **127 SAR**
- Calculate same order in Reports: **125 SAR** ← DIFFERENT! 😱
- Calculate in Salla Import: **130 SAR** ← ALSO DIFFERENT! 😱

**Solution With Centralization:**
- Calculate everywhere with `calculateCompleteOrder()`: **127 SAR** ✅
- Same function → Same inputs → Same outputs → Always consistent! 🎉

---

## 📞 **Support**

For questions about:
- **Architecture:** Review this README
- **Order Calculations:** See `/utils/orderCalculations/` documentation above
- **Report Calculations:** See `/utils/reportCalculations/` section
- **AI Development:** Follow the AI Agent Guidelines strictly

---

**Last Updated:** 2026-01-15  
**Version:** 2.0.0 (Centralized Calculations)  
**Critical Sections:** AI Agent Guidelines, Order Calculations, Report Calculations

---

## 📝 Summary

✅ **One function does everything:** `calculateCompleteOrder()`  
✅ **Same inputs → Same outputs:** Guaranteed consistency  
✅ **Used everywhere:** Calculator, Import, Display  
✅ **Easy to test:** Pure functions  
✅ **Easy to maintain:** Change once, applies everywhere  


## 📊 **Financial Reports & Logic**

This section documents how the major financial reports are calculated.

### **1. Contribution Profit Sharing**
*   **Location:** Reports > Overview
*   **Purpose:** Shows the pure **Gross Profit** generated from orders, split by partner based on product ownership.
*   **Formula:**
    `Total Revenue` - `COGS` - `Order Fees` (Shipping + Payment + Discounts)
*   **Key Note:** This does **NOT** subtract operating expenses (Ads, Salaries, etc.). It is the raw profit from sales.

### **2. Monthly Partner Distributions**
*   **Location:** Reports > Overview
*   **Purpose:** Shows the final amount available to be paid out to partners (Cash Flow).
*   **Formula:**
    `Profit Share` + `Product Cost Recovery` - `Operating Expenses`
*   **Why is it higher?**
    It typically adds back the **Product Cost** to the payout. This is to repay the partner who bought the inventory, ensuring they recover their capital investment plus their profit share. Expenses (like Ads) are then deducted from this total.

### **3. Business Metrics (Profit Funnel)**
*   **Location:** Reports > Business Metrics
*   **Purpose:** A top-down view of business profitability.
*   **Calculation Flow:**
    1.  **Total Revenue:** Sum of all order totals ranges.
    2.  **Product Costs:** Sum of `Cost Price` × `Quantity`.
    3.  **Gross Profit:** `Revenue` - `Product Costs`.
    4.  **Shipping Fees:** Sum of `Order.ShippingMethod.Cost` (What the business pays the carrier).
    5.  **Payment Fees:** Sum of `Order.PaymentFees` (Gateway costs).
    6.  **Operating Expenses:** Sum of manually entered expenses (Marketing, Packaging, etc.).
    7.  **True Net Profit:** `Gross Profit` - `Fees` - `Operating Expenses`.

### **4. Fee Analysis**
*   **Location:** Reports > Fee Analysis
*   **Purpose:** Breakdown of where money is lost to fees.
*   **Shipping Fee Analysis:** Compares "Shipping Collected from Customer" vs "Shipping Paid to Carrier".
*   **Payment Fee Analysis:** Breakdown of costs per payment method (Tamara, Visa, etc.).


---

## 🤝 Need Help?

- Check function comments for examples
- Review `completeOrder.ts` for the full flow
- Look at existing usage in `useOrder.ts` or `SallaImportFlow.tsx`

---

