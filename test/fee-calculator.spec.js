const chai = require('chai');

const FeeCalculator = require('../fee-calculator');
const { cashInUrl, cashOutNatUrl, cashOutLegUrl } = require('../utils');

const { expect } = chai;

const mockConfig = {
  [cashInUrl]: {
    percents: 0.03,
    max: {
      amount: 5,
      currency: 'EUR',
    },
  },
  [cashOutLegUrl]: {
    percents: 0.3,
    min: {
      amount: 0.5,
      currency: 'EUR',
    },
  },
  [cashOutNatUrl]: {
    percents: 0.3,
    week_limit: {
      amount: 1000,
      currency: 'EUR',
    },
  },
};

const calculator = new FeeCalculator(mockConfig);

describe('FeeCalculator', () => {
  it('should return correct fees for cash in operations', () => {
    const notMaxFee = calculator.getCashInFee(100);
    const maxFee = calculator.getCashInFee(10000000);
    expect(notMaxFee).to.be.eq(0.03);
    expect(maxFee).to.be.eq(5);
  });
  it('should return correct fees for cash out operations - juridical person', () => {
    const minFee = calculator.getCashOutFee(100, 'juridical');
    const notMinFee = calculator.getCashOutFee(1000, 'juridical');
    expect(minFee).to.be.eq(0.5);
    expect(notMinFee).to.be.eq(3);
  });
  it('should return correct fees for cash out operations - natural person', () => {
    const limitNotRichedFee = calculator.getCashOutFee(900, 'natural', 100);
    const limitWasRichedFee = calculator.getCashOutFee(100, 'natural', 1000);
    const limitWillBeRichedFee = calculator.getCashOutFee(201, 'natural', 800);
    expect(limitNotRichedFee).to.be.eq(0);
    expect(limitWasRichedFee).to.be.eq(0.3);
    expect(limitWillBeRichedFee).to.be.eq(0.003);
  });
});
