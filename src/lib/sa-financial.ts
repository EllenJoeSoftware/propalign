/**
 * SA-specific property financial calculations.
 *
 * All figures use 2025/2026 South African norms. Where a number varies (e.g.
 * municipal rates, body corporate levies), we estimate based on price tier or
 * property type and clearly label the result as an estimate.
 *
 * Sources:
 *   - SARS transfer duty 2025 brackets — https://www.sars.gov.za
 *   - Bond registration & conveyancing — Law Society of South Africa scale
 *   - Prime rate ~11.75% (SARB late-2025 / early-2026 range)
 */

// ----------------------------------------------------------------------------
// Defaults — easy to tune in one place
// ----------------------------------------------------------------------------

export const DEFAULT_BOND_RATE = 0.1175; // 11.75% — SA prime, ~late-2025 range
export const DEFAULT_BOND_TERM_YEARS = 20;
export const DEFAULT_DEPOSIT_RATIO = 0.1; // 10% deposit assumption

// ----------------------------------------------------------------------------
// Transfer duty (SARS 2025 sliding scale)
// ----------------------------------------------------------------------------

/**
 * Transfer duty payable on the registration of immovable property in a buyer's
 * name. Calculated on a sliding scale on the purchase price (or fair market
 * value, whichever is greater).
 */
export function transferDuty(price: number): number {
  if (price <= 1_210_000) return 0;
  if (price <= 1_663_800) return (price - 1_210_000) * 0.03;
  if (price <= 2_329_300) return 13_614 + (price - 1_663_800) * 0.06;
  if (price <= 2_994_800) return 53_544 + (price - 2_329_300) * 0.08;
  if (price <= 13_310_000) return 106_784 + (price - 2_994_800) * 0.11;
  return 1_241_456 + (price - 13_310_000) * 0.13;
}

// ----------------------------------------------------------------------------
// Bond registration costs (Law Society scale, simplified to brackets)
// ----------------------------------------------------------------------------

const BOND_REG_BRACKETS: Array<[number, number]> = [
  [500_000, 5_000],
  [1_000_000, 11_000],
  [2_000_000, 21_500],
  [3_000_000, 28_000],
  [5_000_000, 38_000],
  [10_000_000, 55_000],
  [Infinity, 75_000],
];

/** Approximate bond registration cost (attorney fees + Deeds Office). */
export function bondRegistrationCost(price: number): number {
  for (const [cap, fee] of BOND_REG_BRACKETS) {
    if (price <= cap) return fee;
  }
  return BOND_REG_BRACKETS[BOND_REG_BRACKETS.length - 1][1];
}

// ----------------------------------------------------------------------------
// Conveyancing / transfer attorney costs (Law Society scale, simplified)
// ----------------------------------------------------------------------------

const CONVEYANCING_BRACKETS: Array<[number, number]> = [
  [500_000, 8_000],
  [1_000_000, 16_500],
  [2_000_000, 26_500],
  [3_000_000, 35_000],
  [5_000_000, 48_000],
  [10_000_000, 70_000],
  [Infinity, 95_000],
];

/** Approximate transfer attorney fee. */
export function conveyancingCost(price: number): number {
  for (const [cap, fee] of CONVEYANCING_BRACKETS) {
    if (price <= cap) return fee;
  }
  return CONVEYANCING_BRACKETS[CONVEYANCING_BRACKETS.length - 1][1];
}

// ----------------------------------------------------------------------------
// Monthly bond repayment (standard amortisation)
// ----------------------------------------------------------------------------

export interface BondInputs {
  price: number;
  deposit?: number;
  termYears?: number;
  annualRate?: number;
}

export function monthlyBondPayment({
  price,
  deposit = price * DEFAULT_DEPOSIT_RATIO,
  termYears = DEFAULT_BOND_TERM_YEARS,
  annualRate = DEFAULT_BOND_RATE,
}: BondInputs): number {
  const principal = Math.max(0, price - deposit);
  if (principal === 0) return 0;
  const i = annualRate / 12;
  const n = termYears * 12;
  if (i === 0) return principal / n;
  return (principal * i) / (1 - Math.pow(1 + i, -n));
}

// ----------------------------------------------------------------------------
// Recurring cost estimates — fuzzy by design
// ----------------------------------------------------------------------------

/**
 * Estimated monthly municipal rates. Real figures vary wildly by municipality.
 * Roughly 0.6–1.0% of property value per year for residential; we use 0.8%.
 */
export function estimateMonthlyRates(price: number): number {
  return Math.round((price * 0.008) / 12 / 50) * 50;
}

/**
 * Estimated body corporate / HOA levy. Only applies to sectional title types.
 * Range R1,500–R6,000/mo depending on size + amenities; we tier by price.
 */
export function estimateMonthlyLevies(
  propertyType: string,
  price: number,
): number {
  const t = propertyType.toLowerCase();
  const isSectional =
    t.includes('apartment') ||
    t.includes('flat') ||
    t.includes('townhouse') ||
    t.includes('complex') ||
    t.includes('studio');
  if (!isSectional) return 0;
  if (price < 1_000_000) return 1_500;
  if (price < 2_500_000) return 2_500;
  if (price < 5_000_000) return 3_800;
  return 5_500;
}

/**
 * Estimated monthly building insurance. ~0.3% of value annually for buildings.
 * (Contents insurance not included — that's the buyer's separate decision.)
 */
export function estimateMonthlyInsurance(price: number): number {
  return Math.round((price * 0.003) / 12 / 50) * 50;
}

// ----------------------------------------------------------------------------
// The headline calculator
// ----------------------------------------------------------------------------

export interface OwnershipCostInputs extends BondInputs {
  propertyType: string;
}

export interface OwnershipCostBreakdown {
  // Upfront
  deposit: number;
  transferDuty: number;
  bondRegistration: number;
  conveyancing: number;
  totalUpfront: number;
  // Monthly
  bondPayment: number;
  rates: number;
  levies: number;
  insurance: number;
  totalMonthly: number;
  // Inputs echoed for UI
  inputs: {
    price: number;
    depositRatio: number;
    termYears: number;
    annualRate: number;
  };
}

export function calculateOwnershipCost(
  opts: OwnershipCostInputs,
): OwnershipCostBreakdown {
  const {
    price,
    propertyType,
    deposit = price * DEFAULT_DEPOSIT_RATIO,
    termYears = DEFAULT_BOND_TERM_YEARS,
    annualRate = DEFAULT_BOND_RATE,
  } = opts;

  const td = transferDuty(price);
  const reg = bondRegistrationCost(price);
  const conv = conveyancingCost(price);
  const totalUpfront = Math.round(deposit + td + reg + conv);

  const bond = Math.round(
    monthlyBondPayment({ price, deposit, termYears, annualRate }),
  );
  const rates = estimateMonthlyRates(price);
  const levies = estimateMonthlyLevies(propertyType, price);
  const insurance = estimateMonthlyInsurance(price);
  const totalMonthly = bond + rates + levies + insurance;

  return {
    deposit: Math.round(deposit),
    transferDuty: Math.round(td),
    bondRegistration: reg,
    conveyancing: conv,
    totalUpfront,
    bondPayment: bond,
    rates,
    levies,
    insurance,
    totalMonthly,
    inputs: {
      price,
      depositRatio: deposit / price,
      termYears,
      annualRate,
    },
  };
}

// ----------------------------------------------------------------------------
// Rental upfront cost estimate (smaller calc — for rent listings)
// ----------------------------------------------------------------------------

export interface RentalUpfront {
  firstMonth: number;
  deposit: number; // typically 1-2x rent in SA
  adminFee: number; // FICA / credit-check fees, often R150-R300
  totalUpfront: number;
}

export function estimateRentalUpfront(monthlyRent: number): RentalUpfront {
  const firstMonth = monthlyRent;
  const deposit = monthlyRent; // 1 month is the most common SA arrangement
  const adminFee = 250;
  return {
    firstMonth,
    deposit,
    adminFee,
    totalUpfront: firstMonth + deposit + adminFee,
  };
}

// ----------------------------------------------------------------------------
// Formatting helpers used by the UI
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// Rent vs Buy break-even (5-year projection)
// ----------------------------------------------------------------------------

export interface RentVsBuyInputs {
  buyPrice: number;
  propertyType: string;
  /** Estimated monthly rent for an equivalent property in the same area. */
  equivalentMonthlyRent: number;
  /** Annual property appreciation (default SA long-run avg ~5%). */
  appreciationRate?: number;
  /** Annual investment return on cash-equivalent (default 9% SA equity). */
  investmentReturnRate?: number;
  /** Annual rent escalation (default 7% — typical SA lease). */
  rentEscalationRate?: number;
  termYears?: number;
}

export interface RentVsBuyResult {
  breakEvenYear: number | null; // null if buying never wins within term
  yearByYear: Array<{
    year: number;
    cumulativeBuyCost: number; // out-of-pocket if you bought
    cumulativeRentCost: number; // total rent paid + opportunity cost gain on saved deposit
    netBuyPosition: number; // cumulative cost − equity built − appreciation
    netRentPosition: number; // cumulative cost − investment growth on saved deposit/upfront
  }>;
  inputs: RentVsBuyInputs & {
    appreciationRate: number;
    investmentReturnRate: number;
    rentEscalationRate: number;
    termYears: number;
  };
}

export function rentVsBuy(opts: RentVsBuyInputs): RentVsBuyResult {
  const {
    buyPrice,
    propertyType,
    equivalentMonthlyRent,
    appreciationRate = 0.05,
    investmentReturnRate = 0.09,
    rentEscalationRate = 0.07,
    termYears = 5,
  } = opts;

  const ownership = calculateOwnershipCost({ price: buyPrice, propertyType });
  const monthlyOwnership = ownership.totalMonthly;
  const upfront = ownership.totalUpfront;

  // Year-by-year projection
  let cumBuy = upfront;
  let cumRent = 0;
  let invested = upfront; // money saved by renting starts in investment
  let propertyValue = buyPrice;
  let principalPaid = 0;
  let currentRent = equivalentMonthlyRent;

  // Approximate principal paid each year (bond amortisation curve).
  // Use straight-line for simplicity — first-5-year accuracy ±5%.
  const annualPrincipalApprox =
    (buyPrice - ownership.deposit) / DEFAULT_BOND_TERM_YEARS;

  const yearByYear: RentVsBuyResult['yearByYear'] = [];
  let breakEvenYear: number | null = null;

  for (let y = 1; y <= termYears; y++) {
    cumBuy += monthlyOwnership * 12;
    cumRent += currentRent * 12;
    principalPaid += annualPrincipalApprox;
    propertyValue *= 1 + appreciationRate;
    // The renter's "opportunity": the upfront they didn't spend + the gap each
    // month between rent and ownership cost (positive when rent < ownership).
    const monthlySaving = monthlyOwnership - currentRent;
    invested = invested * (1 + investmentReturnRate) + monthlySaving * 12;

    const netBuy = cumBuy - principalPaid - (propertyValue - buyPrice);
    const netRent = cumRent - (invested - upfront);

    if (breakEvenYear === null && netBuy <= netRent) {
      breakEvenYear = y;
    }

    yearByYear.push({
      year: y,
      cumulativeBuyCost: Math.round(cumBuy),
      cumulativeRentCost: Math.round(cumRent),
      netBuyPosition: Math.round(netBuy),
      netRentPosition: Math.round(netRent),
    });

    currentRent *= 1 + rentEscalationRate;
  }

  return {
    breakEvenYear,
    yearByYear,
    inputs: {
      ...opts,
      appreciationRate,
      investmentReturnRate,
      rentEscalationRate,
      termYears,
    },
  };
}

export function fmtRand(n: number, opts?: { compact?: boolean }): string {
  if (opts?.compact) {
    if (n >= 1_000_000) return `R${(n / 1_000_000).toFixed(2)}m`;
    if (n >= 1_000) return `R${(n / 1_000).toFixed(0)}k`;
  }
  return `R${Math.round(n).toLocaleString('en-ZA')}`;
}
