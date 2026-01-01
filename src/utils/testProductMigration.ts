/**
 * Product Migration Test Script
 * 
 * This script tests the product migration from localStorage to database:
 * 1. Captures current localStorage products
 * 2. Fetches products from database
 * 3. Compares the two sources
 * 4. Reports any discrepancies
 */

import { getProducts as getProductsFromLocalStorage } from '../data/products';
import { getProducts as getProductsFromDatabase } from '../services/productService';

interface ComparisonResult {
    success: boolean;
    localStorageCount: number;
    databaseCount: number;
    missingInDatabase: string[];
    missingInLocalStorage: string[];
    differences: ProductDifference[];
}

interface ProductDifference {
    productId: string;
    field: string;
    localStorageValue: any;
    databaseValue: any;
}

/**
 * Compare products from localStorage and database
 */
export const compareProducts = async (): Promise<ComparisonResult> => {
    console.log('🔍 Starting product comparison...\n');

    // Get products from both sources
    const localProducts = await getProductsFromLocalStorage();
    const dbProducts = await getProductsFromDatabase();

    console.log(`📦 LocalStorage products: ${localProducts.length}`);
    console.log(`🗄️  Database products: ${dbProducts.length}\n`);

    const result: ComparisonResult = {
        success: true,
        localStorageCount: localProducts.length,
        databaseCount: dbProducts.length,
        missingInDatabase: [],
        missingInLocalStorage: [],
        differences: [],
    };

    // Create maps for easy lookup
    const localMap = new Map(localProducts.map(p => [p.id, p]));
    const dbMap = new Map(dbProducts.map(p => [p.id, p]));

    // Check for missing products in database
    for (const localProduct of localProducts) {
        if (!dbMap.has(localProduct.id)) {
            result.missingInDatabase.push(localProduct.id);
            result.success = false;
        }
    }

    // Check for extra products in database
    for (const dbProduct of dbProducts) {
        if (!localMap.has(dbProduct.id)) {
            result.missingInLocalStorage.push(dbProduct.id);
        }
    }

    // Compare matching products
    for (const localProduct of localProducts) {
        const dbProduct = dbMap.get(localProduct.id);
        if (!dbProduct) continue;

        // Compare each field
        if (localProduct.name !== dbProduct.name) {
            result.differences.push({
                productId: localProduct.id,
                field: 'name',
                localStorageValue: localProduct.name,
                databaseValue: dbProduct.name,
            });
            result.success = false;
        }

        if (localProduct.sku !== dbProduct.sku) {
            result.differences.push({
                productId: localProduct.id,
                field: 'sku',
                localStorageValue: localProduct.sku,
                databaseValue: dbProduct.sku,
            });
            result.success = false;
        }

        if (localProduct.cost !== dbProduct.cost) {
            result.differences.push({
                productId: localProduct.id,
                field: 'cost',
                localStorageValue: localProduct.cost,
                databaseValue: dbProduct.cost,
            });
            result.success = false;
        }

        if (localProduct.sellingPrice !== dbProduct.sellingPrice) {
            result.differences.push({
                productId: localProduct.id,
                field: 'sellingPrice',
                localStorageValue: localProduct.sellingPrice,
                databaseValue: dbProduct.sellingPrice,
            });
            result.success = false;
        }

        if (localProduct.owner !== dbProduct.owner) {
            result.differences.push({
                productId: localProduct.id,
                field: 'owner',
                localStorageValue: localProduct.owner,
                databaseValue: dbProduct.owner,
            });
            result.success = false;
        }
    }

    return result;
};

/**
 * Print comparison report
 */
export const printComparisonReport = (result: ComparisonResult): void => {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PRODUCT MIGRATION COMPARISON REPORT');
    console.log('='.repeat(60) + '\n');

    console.log(`📦 LocalStorage Count: ${result.localStorageCount}`);
    console.log(`🗄️  Database Count: ${result.databaseCount}\n`);

    if (result.success) {
        console.log('✅ SUCCESS: All products match perfectly!\n');
        console.log('✓ All products from localStorage exist in database');
        console.log('✓ All product data matches exactly');
        console.log('✓ Migration is verified and safe to proceed\n');
    } else {
        console.log('❌ ISSUES FOUND:\n');

        if (result.missingInDatabase.length > 0) {
            console.log(`⚠️  Missing in Database (${result.missingInDatabase.length}):`);
            result.missingInDatabase.forEach(id => {
                console.log(`   - ${id}`);
            });
            console.log('');
        }

        if (result.missingInLocalStorage.length > 0) {
            console.log(`ℹ️  Extra in Database (${result.missingInLocalStorage.length}):`);
            result.missingInLocalStorage.forEach(id => {
                console.log(`   - ${id}`);
            });
            console.log('');
        }

        if (result.differences.length > 0) {
            console.log(`⚠️  Data Differences (${result.differences.length}):`);
            result.differences.forEach(diff => {
                console.log(`   Product: ${diff.productId}`);
                console.log(`   Field: ${diff.field}`);
                console.log(`   LocalStorage: ${diff.localStorageValue}`);
                console.log(`   Database: ${diff.databaseValue}`);
                console.log('');
            });
        }
    }

    console.log('='.repeat(60) + '\n');
};

/**
 * Run the migration test
 */
export const runMigrationTest = async (): Promise<boolean> => {
    try {
        const result = await compareProducts();
        printComparisonReport(result);
        return result.success;
    } catch (error) {
        console.error('❌ Error running migration test:', error);
        return false;
    }
};

// Export for use in other scripts
export default runMigrationTest;
