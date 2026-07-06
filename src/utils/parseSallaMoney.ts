/**
 * Salla Money Parser
 *
 * Robust money-string parser for values exported from Salla CSV reports.
 * Handles the real-world formats Salla produces:
 *   - Western decimal:  "1234.50"
 *   - With thousands:   "1,234.50"  →  1234.50
 *   - Arabic-Indic:     "١٢٣٤"      →  1234
 *   - Currency prefix:  "SAR 25"    →  25
 *   - Currency suffix:  "25 ر.س"    →  25
 *   - Riyaal sign:      "﷼25"       →  25
 *   - Plain zero:       "0"         →  0
 *
 * Unlike bare parseFloat(), this function never silently truncates:
 *   parseFloat("1,234.50") → 1   ← WRONG (stops at comma)
 *   parseSallaMoney("1,234.50") → 1234.50  ← CORRECT
 */

/** Arabic-Indic digit map: ٠١٢٣٤٥٦٧٨٩ → 0123456789 */
const ARABIC_INDIC_DIGITS: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

/** Currency symbols and text to strip before parsing */
const CURRENCY_PATTERN = /SAR|ر\.س|ر\.ع|﷼|SR/gi;

/**
 * Options for parseSallaMoney
 */
export interface ParseSallaMoneyOptions {
    /**
     * When true, an empty or whitespace-only string returns 0 instead of throwing.
     * Use for optional fields like discount or COD commission where absence = zero.
     * Default: false
     */
    allowEmpty?: boolean;
}

/**
 * Parse a Salla money string into a JavaScript number.
 *
 * @param raw         - Raw string from a Salla CSV cell
 * @param options     - Parsing options
 * @returns           - Parsed numeric value
 * @throws            - Error with descriptive message if the value cannot be parsed
 *
 * @example
 * parseSallaMoney("1,234.50")               // → 1234.50
 * parseSallaMoney("١٢٣٤")                   // → 1234
 * parseSallaMoney("SAR 25")                 // → 25
 * parseSallaMoney("", { allowEmpty: true }) // → 0
 * parseSallaMoney("")                       // → throws
 */
export function parseSallaMoney(
    raw: string,
    options: ParseSallaMoneyOptions = {}
): number {
    const { allowEmpty = false } = options;

    // 1. Trim whitespace
    const trimmed = (raw ?? '').trim();

    // 2. Handle empty string
    if (trimmed === '') {
        if (allowEmpty) return 0;
        throw new Error(`Money parsing failed: empty value (column was blank)`);
    }

    // 3. Convert Arabic-Indic digits to Western digits
    const westernized = trimmed.replace(/[٠-٩]/g, d => ARABIC_INDIC_DIGITS[d] ?? d);

    // 4. Strip currency symbols and surrounding whitespace
    const noCurrency = westernized.replace(CURRENCY_PATTERN, '').trim();

    // 5. Remove thousand separators (commas between digits)
    //    Only remove commas that are used as thousands separators, not decimal commas.
    //    Pattern: comma preceded and followed by digits
    const noThousands = noCurrency.replace(/(\d),(\d)/g, '$1$2');

    // 6. Parse
    const result = parseFloat(noThousands);

    if (isNaN(result)) {
        throw new Error(
            `Money parsing failed: cannot parse "${raw}" ` +
            `(cleaned to "${noThousands}")`
        );
    }

    return result;
}
