# Worthwhile Financial Model Assumptions

**Status:** Draft for product and financial-domain review
**Scope:** Browser-only planning estimates in GBP, using monthly take-home income

This document describes the assumptions currently implemented by Worthwhile. It
is not financial advice, a lending decision, or a statement that these rules are
appropriate for every person or jurisdiction.

## Inputs And Normalisation

- Monetary inputs are treated as non-negative values in pounds.
- Empty, invalid, `NaN`, and infinite numeric values are treated as zero.
- Monetary values are capped at `£1,000,000,000` to prevent invalid or unsafe
  calculations from extreme input or tampered saved data.
- Loan terms are constrained to 1 to 60 months for calculation purposes.
- Interest rates are constrained to 0% to 100% for calculation purposes.
- Browser `localStorage` is convenience storage on the current device, not a
  source of verified financial data.

## Purchase Calculations

### Finance

The financed principal is:

```text
max(0, purchase price - deposit)
```

For a non-zero annual interest rate, the monthly repayment uses the standard
amortising-loan formula:

```text
P * r * (1 + r)^n / ((1 + r)^n - 1)
```

Where `P` is principal, `r` is the annual rate divided by 1,200, and `n` is the
number of months. At 0% interest, repayment is principal divided by the term.
The displayed monthly repayment is rounded to the nearest pound.

Displayed interest is calculated from the rounded monthly repayment multiplied
by the term, less principal. This is an estimate and may differ slightly from a
lender's amortisation schedule, which may use daily interest, fees, or a final
payment adjustment.

### Cash

The cash purchase amount is the full purchase price. The current model assumes
no existing cash balance is available for the purchase, so the time-to-save
estimate uses the planned monthly saving pace and disposable margin.

## Moving-Home Calculations

The one-time move-in total is:

```text
rent + moving costs + furniture and setup
```

Utilities are excluded from this one-time total and included in recurring
monthly housing costs. Monthly housing cost is `rent + utilities`.

## Emergency-Fund Calculations

The essential monthly spend is currently derived from:

```text
rent + utilities + transport + food + debt payments + other commitments
```

The emergency-fund target is six times essential monthly spend, plus six times
any additional monthly costs entered in the active calculator.

If savings already meet the target, time to goal is zero. Otherwise, time to
goal is the ceiling of the remaining gap divided by the validated monthly
saving pace. A zero or unaffordable saving pace produces `Not possible` rather
than a finish date.

## Saving-Pace Heuristic

When no explicit positive saving pace is entered:

- Less than 10% of take-home income remaining after listed costs means saving is
  treated as currently unavailable.
- Between 10% and 20% remaining, the suggested saving pace is 10% of income.
- More than 20% remaining, the suggested saving pace is 15% of income.

An explicitly entered pace is only used for the safety-net plan when it is no
greater than disposable margin and a positive suggested pace is possible.

These percentages are product heuristics, not savings-industry requirements.

## Budgeting Guidelines

The Finance Health panel compares spending with these configurable model
guidelines:

The 30% housing guideline uses monthly rent alone for moving plans. Purchase
and safety plans use their recurring monthly housing cost; utilities and other
listed commitments remain part of the broader cash-flow and affordability
calculations.

| Category          | Current guideline             |
| ----------------- | ----------------------------- |
| Housing           | Up to 30% of take-home income |
| Housing plus debt | Up to 36%                     |
| Debt repayments   | Up to 20%                     |
| Transport         | 10% to 15%                    |
| Food              | 10% to 15%                    |
| Utilities         | 5% to 10%                     |
| Savings           | At least 10%                  |

Values exactly on a boundary are considered within the guideline. With zero
income, the ratio is treated as 100% so the plan does not appear affordable.

## Overall Score

Purchase and moving scores are product-specific signals, not credit scores:

```text
clamp(round(100 - total cost ratio * 145 - move-in penalty), 0, 100)
```

For moving plans, the move-in penalty is move-in total divided by the greater
of take-home income or £1, divided by two. Safety-net score is the percentage
of the emergency target already saved, capped at 100. A zero emergency target
scores 100.

The labels `Comfortable`, `Worth a closer look`, and `This may stretch you` are
based on the model's ratios and score. They must not be interpreted as an
approval, affordability guarantee, or personalised financial recommendation.

## Known Limitations

The current model does not account for taxes, benefits, dependants, household
size, irregular income, inflation, investment returns, overdrafts, fees,
insurance, maintenance, council tax, lender-specific APR calculations, payment
frequency, variable rates, or regional cost differences. Users are expected to
include relevant amounts in the available input categories where possible.

The six-month emergency-fund period, percentage guidelines, score weighting,
and saving heuristic require review by a qualified financial-domain reviewer
before the app is marketed as a reliable financial planning tool.

## Review Requirements

Before public launch, the product owner should record:

1. The intended jurisdiction and user population.
2. A named domain reviewer who approves each guideline and formula.
3. Representative scenarios with expected outputs, including zero income,
   existing debt, negative disposable income, and irregular costs.
4. A policy for updating and communicating changes to these assumptions.
5. The exact wording and placement of the financial-information disclaimer.
