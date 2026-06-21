import assert from 'node:assert/strict';
import { calculateIndicativeMotorQuote } from '../src/lib/motor-rating';
import type { MotorVehicleInfo } from '../src/store/useApplicationStore';

const comprehensiveVehicle: MotorVehicleInfo = {
  fullName: 'John Test',
  address: '123 Test Street, Makati City',
  phone: '09171234567',
  email: 'john.test@example.com',
  plateNumber: 'ABC1234',
  mvFileNumber: '1301-00000012345',
  make: 'Toyota',
  model: 'Corolla',
  yearModel: '2015',
  variant: '1.6 E CVT',
  bodyType: 'Sedan',
  color: 'White',
  seatingCapacity: '5',
  vehicleUse: 'Private',
  chassisNumber: 'CHASSIS123',
  engineNumber: 'ENGINE123',
  conductionSticker: 'STICKER123',
  vehicleCondition: 'Used',
  estimatedMarketValue: '600000',
  effectiveDate: '2026-06-21',
  coverageType: 'Comprehensive',
  actsOfNature: '',
  thirdPartyPropertyDamageLimit: '200000',
  autoPersonalAccident: 'Included',
  deductibleParticipation: '',
  roadsideAssistance: 'Not Included',
};

const comprehensiveQuote = calculateIndicativeMotorQuote(comprehensiveVehicle);
const apaLine = comprehensiveQuote.lineItems.find((item) => item.key === 'auto_personal_accident');

assert.equal(comprehensiveQuote.status, 'quote_ready');
assert.equal(apaLine?.amountPHP, 250);
assert.equal(apaLine?.status, 'calculated');
assert.match(apaLine?.notes?.join(' ') ?? '', /5 seats × PHP 50/);
assert.equal(comprehensiveQuote.estimatedGrossPremiumPHP, 16218.76);

const ctplQuote = calculateIndicativeMotorQuote({
  ...comprehensiveVehicle,
  coverageType: 'CTPL',
  autoPersonalAccident: '',
});

assert.equal(ctplQuote.status, 'quote_ready');
assert.ok(!ctplQuote.lineItems.some((item) => item.key === 'auto_personal_accident'));
assert.equal(ctplQuote.estimatedGrossPremiumPHP, 700);

console.log('Motor quote validation passed.');
