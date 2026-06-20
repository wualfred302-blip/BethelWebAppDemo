import assert from 'node:assert/strict';
import rating from '../src/data/motor/rating-table.json' with { type: 'json' };

assert.equal(rating.ctpl[0].oneYearTotalPremiumPHP, 560, 'Private car CTPL one-year premium should be PHP 560');
assert.equal(rating.ctpl[0].threeYearTotalPremiumPHP, 1610, 'Private car CTPL three-year premium should be PHP 1,610');
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

const privateCarTppd = rating.voluntaryThirdPartyLiability.propertyDamage.tables.find((entry) => entry.vehicleClass === 'private_car');
assert.ok(privateCarTppd, 'Private car TPPD table should be present');
assert.ok(privateCarTppd.entries.find((entry) => entry.limitPHP === 100000), 'Private car TPPD 100k row should be present');
assert.equal(
  privateCarTppd.entries.find((entry) => entry.limitPHP === 100000).premiumPHP,
  1095,
  'Private car TPPD 100k premium should be PHP 1,095',
);
assert.ok(privateCarTppd.entries.find((entry) => entry.limitPHP === 500000), 'Private car TPPD 500k row should be present');
assert.equal(
  privateCarTppd.entries.find((entry) => entry.limitPHP === 500000).premiumPHP,
  1635,
  'Private car TPPD 500k premium should be PHP 1,635',
);

const privateCarBi = rating.voluntaryThirdPartyLiability.bodilyInjury.tables.find((entry) => entry.vehicleClass === 'private_car');
assert.ok(privateCarBi, 'Private car bodily injury table should be present');

[
  [50000, 195],
  [75000, 225],
  [100000, 270],
  [150000, 345],
  [200000, 420],
  [250000, 510],
  [300000, 585],
  [400000, 675],
  [500000, 780],
].forEach(([limitPHP, premiumPHP]) => {
  const row = privateCarBi.entries.find((entry) => entry.limitPHP === limitPHP);
  assert.ok(row, `Private car bodily injury ${limitPHP} row should be present`);
  assert.equal(row.premiumPHP, premiumPHP, `Private car bodily injury ${limitPHP} premium should be PHP ${premiumPHP}`);
});

console.log('Motor tariff validation passed.');
