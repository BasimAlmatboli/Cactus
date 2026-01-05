import { SallaOrder, SallaProduct } from '../types';

/**
 * Parse Salla CSV format
 * 
 * Column Order (tab or comma separated) - from LEFT to RIGHT:
 * 0. رقم الطلب (Order Number)
 * 1. اسم العميل (Customer Name)
 * 2. مجموع السلة (Cart Subtotal)
 * 3. الخصم (Discount)
 * 4. تكلفة الشحن (Shipping Cost)
 * 5. طريقة الدفع (Payment Method)
 * 6. عمولة الدفع عند الاستلام (COD Commission)
 * 7. إجمالي الطلب (Order Total)
 * 8. تاريخ الطلب (Order Date) - M/D/YYYY H:mm
 * 9. شركة الشحن / الفرع (Shipping Company)
 * 10. skus_json (Products JSON)
 */

export interface ParseResult {
    orders: SallaOrder[];
    parseLog: ParseLogEntry[];
    summary: {
        totalRows: number;
        successfulRows: number;
        failedRows: number;
        delimiter: string;
    };
}

export interface ParseLogEntry {
    rowNumber: number;
    status: 'success' | 'error' | 'warning' | 'info';
    message: string;
    rawContent?: string;
    columnCount?: number;
}

export async function parseSallaCSV(file: File): Promise<SallaOrder[]> {
    const result = await parseSallaCSVWithLog(file);

    if (result.summary.failedRows > 0) {
        const firstError = result.parseLog.find(l => l.status === 'error');
        throw new Error(firstError?.message || 'Failed to parse CSV');
    }

    return result.orders;
}

export async function parseSallaCSVWithLog(file: File): Promise<ParseResult> {
    const parseLog: ParseLogEntry[] = [];
    const orders: SallaOrder[] = [];

    parseLog.push({
        rowNumber: 0,
        status: 'info',
        message: `Starting to parse file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
    });

    const text = await file.text();

    // Handle multi-line quoted fields by merging lines that are inside quotes
    const mergedLines = mergeMultilineRows(text);
    const lines = mergedLines.filter(line => line.trim());

    parseLog.push({
        rowNumber: 0,
        status: 'info',
        message: `File contains ${lines.length} logical rows (after merging multi-line fields)`,
    });

    if (lines.length < 2) {
        parseLog.push({
            rowNumber: 0,
            status: 'error',
            message: 'CSV file is empty or has only header row',
        });
        return {
            orders: [],
            parseLog,
            summary: { totalRows: 0, successfulRows: 0, failedRows: 1, delimiter: 'unknown' },
        };
    }

    // Auto-detect delimiter from header row
    const headerRow = lines[0];
    const delimiter = detectDelimiter(headerRow);

    parseLog.push({
        rowNumber: 0,
        status: 'info',
        message: `Detected delimiter: "${delimiter === '\t' ? 'TAB' : delimiter === ',' ? 'COMMA' : delimiter}"`,
    });

    // Parse header
    const headerColumns = splitCSVRow(headerRow, delimiter);
    parseLog.push({
        rowNumber: 1,
        status: 'info',
        message: `Header has ${headerColumns.length} columns: ${headerColumns.slice(0, 5).join(', ')}${headerColumns.length > 5 ? '...' : ''}`,
        columnCount: headerColumns.length,
        rawContent: headerRow.slice(0, 200) + (headerRow.length > 200 ? '...' : ''),
    });

    if (headerColumns.length < 11) {
        parseLog.push({
            rowNumber: 1,
            status: 'warning',
            message: `Expected 11 columns but header has ${headerColumns.length}. This may cause parsing issues.`,
        });
    }

    // Skip header row
    const dataLines = lines.slice(1);
    let successfulRows = 0;
    let failedRows = 0;

    for (let i = 0; i < dataLines.length; i++) {
        const rowNumber = i + 2; // +2 for 1-indexed and header row
        const line = dataLines[i].trim();

        if (!line) {
            parseLog.push({
                rowNumber,
                status: 'warning',
                message: 'Empty row, skipping',
            });
            continue;
        }

        try {
            const columns = splitCSVRow(line, delimiter);

            parseLog.push({
                rowNumber,
                status: 'info',
                message: `Row has ${columns.length} columns`,
                columnCount: columns.length,
                rawContent: line.slice(0, 300) + (line.length > 300 ? '...' : ''),
            });

            if (columns.length < 11) {
                parseLog.push({
                    rowNumber,
                    status: 'error',
                    message: `Expected 11 columns but found ${columns.length}. Columns found: [${columns.map((c, i) => `${i + 1}:"${c.slice(0, 30)}${c.length > 30 ? '...' : ''}"`).join(', ')}]`,
                    rawContent: line.slice(0, 500),
                    columnCount: columns.length,
                });
                failedRows++;
                continue;
            }

            const order = parseSallaCSVRow(columns, rowNumber, parseLog);
            orders.push(order);
            successfulRows++;

            parseLog.push({
                rowNumber,
                status: 'success',
                message: `Successfully parsed order #${order.orderNumber} - ${order.products.length} product(s), total: ${order.orderTotal} SAR`,
            });
        } catch (error) {
            failedRows++;
            parseLog.push({
                rowNumber,
                status: 'error',
                message: `Failed to parse: ${error instanceof Error ? error.message : String(error)}`,
                rawContent: line.slice(0, 500),
            });
        }
    }

    parseLog.push({
        rowNumber: 0,
        status: 'info',
        message: `Parsing complete: ${successfulRows} successful, ${failedRows} failed out of ${dataLines.length} data rows`,
    });

    return {
        orders,
        parseLog,
        summary: {
            totalRows: dataLines.length,
            successfulRows,
            failedRows,
            delimiter: delimiter === '\t' ? 'TAB' : delimiter,
        },
    };
}

/**
 * Auto-detect delimiter (tab, comma, or semicolon)
 */
/**
 * Merge lines that are part of a multi-line quoted field.
 * This handles cases where the skus_json field contains newlines inside quotes.
 * 
 * Example problematic input:
 * 224424682,احمد,...,"[
 *     [""product"", 1, ""SKU""]
 *   ]"
 * 
 * This should be merged into a single row.
 */
function mergeMultilineRows(text: string): string[] {
    const result: string[] = [];
    const rawLines = text.split('\n');

    let currentRow = '';
    let inQuotedField = false;

    for (const line of rawLines) {
        if (!inQuotedField) {
            // Starting a new row
            currentRow = line;

            // Count quotes to see if we're in a quoted field
            const quoteCount = (line.match(/"/g) || []).length;

            // If odd number of quotes, we're inside a quoted field that continues
            if (quoteCount % 2 !== 0) {
                inQuotedField = true;
            } else {
                // Complete row, add it
                if (currentRow.trim()) {
                    result.push(currentRow);
                }
                currentRow = '';
            }
        } else {
            // We're continuing a multi-line quoted field
            currentRow += '\n' + line;

            // Count quotes in this line to see if we're closing the quoted field
            const quoteCount = (line.match(/"/g) || []).length;

            // If odd number of quotes, the quoted field is now closed
            if (quoteCount % 2 !== 0) {
                inQuotedField = false;
                if (currentRow.trim()) {
                    result.push(currentRow);
                }
                currentRow = '';
            }
        }
    }

    // Don't forget the last row if it wasn't added
    if (currentRow.trim()) {
        result.push(currentRow);
    }

    return result;
}

function detectDelimiter(headerRow: string): string {
    const tabCount = (headerRow.match(/\t/g) || []).length;
    const commaCount = (headerRow.match(/,/g) || []).length;
    const semicolonCount = (headerRow.match(/;/g) || []).length;

    console.log(`Delimiter detection: tabs=${tabCount}, commas=${commaCount}, semicolons=${semicolonCount}`);

    // If we have many tabs, use tab
    if (tabCount >= 10) return '\t';
    // If we have many commas, use comma
    if (commaCount >= 10) return ',';
    // If we have many semicolons, use semicolon
    if (semicolonCount >= 10) return ';';

    // Default to whichever has more
    if (tabCount >= commaCount && tabCount >= semicolonCount) return '\t';
    if (commaCount >= semicolonCount) return ',';
    return ';';
}

/**
 * Split CSV row handling quoted fields
 */
function splitCSVRow(row: string, delimiter: string): string[] {
    // If delimiter is tab, simple split usually works
    if (delimiter === '\t') {
        return row.split('\t').map(s => s.trim());
    }

    // For comma/semicolon, need to handle quoted fields
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];

        if (char === '"') {
            // Check for escaped quote
            if (inQuotes && row[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

function parseSallaCSVRow(columns: string[], rowNumber: number, log: ParseLogEntry[]): SallaOrder {
    /**
     * CORRECT Column mapping (0-indexed):
     * 0 = رقم الطلب (Order Number)
     * 1 = اسم العميل (Customer Name)
     * 2 = مجموع السلة (Cart Subtotal)
     * 3 = الخصم (Discount)
     * 4 = تكلفة الشحن (Shipping Cost)
     * 5 = طريقة الدفع (Payment Method)
     * 6 = عمولة الدفع عند الاستلام (COD Commission)
     * 7 = إجمالي الطلب (Order Total)
     * 8 = تاريخ الطلب (Order Date)
     * 9 = شركة الشحن / الفرع (Shipping Company)
     * 10 = skus_json (Products JSON)
     */

    // Parse date from column 8 (M/D/YYYY H:mm format)
    const dateStr = columns[8].trim();
    let orderDate: Date;

    try {
        orderDate = parseSallaDate(dateStr);
    } catch (e) {
        log.push({
            rowNumber,
            status: 'warning',
            message: `Date parsing warning: ${e instanceof Error ? e.message : 'Unknown'}, using current date`,
        });
        orderDate = new Date();
    }

    // Parse numeric values from correct columns
    const cartSubtotal = parseFloat(columns[2]) || 0;
    const discount = parseFloat(columns[3]) || 0;
    const shippingCost = parseFloat(columns[4]) || 0;
    const codCommission = parseFloat(columns[6]) || 0;
    const orderTotal = parseFloat(columns[7]) || 0;

    // Clean shipping company name (remove surrounding quotes if present)
    const shippingCompany = cleanShippingName(columns[9].trim());

    // Parse skus_json - this is the most complex part
    let products: SallaProduct[] = [];
    const skusJson = columns[10].trim();

    try {
        products = parseSkusJson(skusJson);
    } catch (e) {
        log.push({
            rowNumber,
            status: 'warning',
            message: `Products JSON parsing issue: ${e instanceof Error ? e.message : 'Unknown'}. Raw value: "${skusJson.slice(0, 100)}"`,
        });
        products = [];
    }

    return {
        orderDate,
        orderNumber: columns[0].trim(),
        customerName: columns[1].trim(),
        cartSubtotal,
        discount,
        shippingCost,
        paymentMethod: columns[5].trim(),
        codCommission,
        orderTotal,
        shippingCompany,
        products,
    };
}

/**
 * Parse Salla date format: M/D/YYYY H:mm
 * Examples: "12/18/2025 11:46", "12/2/2025 18:27"
 */
function parseSallaDate(dateStr: string): Date {
    const parts = dateStr.split(' ');
    if (parts.length !== 2) {
        throw new Error(`Invalid date format: "${dateStr}" (expected "M/D/YYYY H:mm")`);
    }

    const [datePart, timePart] = parts;
    const dateParts = datePart.split('/');
    const timeParts = timePart.split(':');

    if (dateParts.length !== 3) {
        throw new Error(`Invalid date part: "${datePart}" (expected M/D/YYYY)`);
    }

    const [month, day, year] = dateParts.map(Number);
    const hours = parseInt(timeParts[0]) || 0;
    const minutes = parseInt(timeParts[1]) || 0;

    if (isNaN(month) || isNaN(day) || isNaN(year)) {
        throw new Error(`Invalid date numbers: month=${month}, day=${day}, year=${year}`);
    }

    // JavaScript Date months are 0-indexed
    const date = new Date(year, month - 1, day, hours, minutes);

    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date result for: ${dateStr}`);
    }

    return date;
}

/**
 * Clean shipping company name
 * Removes surrounding quotes like 'ريدبوكس' → ريدبوكس
 */
function cleanShippingName(name: string): string {
    return name.replace(/^['"]|['"]$/g, '').trim();
}

/**
 * Parse skus_json format: [[\"Product Name\", quantity, \"SKU\"], ...]
 * Example: "[[\\\"ماوس باد بطابع عربي - Arabian Mousepad\\\", 1, \\\"MP-L-001\\\"]]"
 */
function parseSkusJson(jsonStr: string): SallaProduct[] {
    if (!jsonStr || jsonStr === '[]' || jsonStr === 'null') {
        return [];
    }

    try {
        // Clean up the JSON string - sometimes it has extra escaping
        let cleanJson = jsonStr;

        // Remove surrounding quotes if present
        if (cleanJson.startsWith('"') && cleanJson.endsWith('"')) {
            cleanJson = cleanJson.slice(1, -1);
        }

        // Unescape escaped quotes
        cleanJson = cleanJson.replace(/\\"/g, '"');

        const parsed = JSON.parse(cleanJson);

        if (!Array.isArray(parsed)) {
            throw new Error('skus_json is not an array');
        }

        return parsed.map((item, index) => {
            if (!Array.isArray(item)) {
                throw new Error(`Product at index ${index} is not an array`);
            }

            if (item.length < 2) {
                throw new Error(`Product at index ${index} has insufficient data (${item.length} elements)`);
            }

            return {
                name: String(item[0]).trim(),
                quantity: Number(item[1]) || 1,
                sku: item.length > 2 ? String(item[2]).trim() : '',
            };
        });
    } catch (error) {
        console.error('Error parsing skus_json:', jsonStr.slice(0, 200), error);
        throw new Error(`Failed to parse products JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Validate parsed Salla order
 */
export function validateSallaOrder(order: SallaOrder): string[] {
    const errors: string[] = [];

    if (!order.orderNumber) {
        errors.push('Missing order number');
    }

    if (!order.customerName) {
        errors.push('Missing customer name');
    }

    if (order.products.length === 0) {
        errors.push('No products in order');
    }

    if (order.orderTotal <= 0) {
        errors.push('Invalid order total');
    }

    return errors;
}
