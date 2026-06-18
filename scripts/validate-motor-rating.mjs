import assert from 'node:assert/strict';
import rating from '../src/data/motor/rating-table.json' with { type: 'json' };

assert.equal(rating.ctpl[0].oneYearTotalPremiumPHP, 560, 'Private car CTPL one-year premium should be PHP 560');
assert.equal(rating.ctpl[0].threeYearTotalPremiumPHP, 1670, 'Private car CTPL three-year premium should be PHP 1,670');
assert.equal(rating.actsOfNature.ratePercent, 0.5, 'AON minimum rate should be 0.50%');
assert.equal(rating.privateCar.deductible.fixedMinimumPHP, 2000, 'Private car deductible minimum should be PHP 2,000');
assert.equal(rating.privateCar.deductible.percentOfSumInsured, 0.5, 'Private car deductible should be 0.5% of sum insured');
assert.equal(
  rating.privateCar.deductibleDiscounts[0].minimumDeductiblePHP,
  3000,
  'Private car deductible discount threshold should include PHP 3,000',
);
assert.equal(
  rating.privateCar.deductibleDiscounts[0].discountPercent,
  6,
  'Private car deductible discount should include 6%',
);
assert.equal(
  rating.privateCar.deductibleDiscounts[1].minimumDeductiblePHP,
  4000,
  'Private car deductible discount threshold should include PHP 4,000',
);
assert.equal(
  rating.privateCar.deductibleDiscounts[1].discountPercent,
  12,
  'Private car deductible discount should include 12%',
);

console.log('Motor tariff validation passed.');
