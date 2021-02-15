const axios = require('axios');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const NodeCache = require('node-cache');

const {
  getConfig,
  getAccumulatedAmount,
  write,
  cashInUrl,
  cashOutNatUrl,
  cashOutLegUrl,
} = require('../utils');

const { expect } = chai;
chai.use(sinonChai);
const mockCache = new NodeCache();
const sandBox = sinon.createSandbox();

describe('getConfig function', () => {
  beforeEach(() => sandBox.stub(axios, 'get'));
  afterEach(() => sandBox.restore());

  it('should get correct config objects', (done) => {
    axios.get.resolves({ data: 100 });
    getConfig([cashInUrl])
      .then((results) => {
        expect(axios.get).to.have.been.calledOnce;
        expect(results[cashInUrl]).to.be.eq(100);
        done();
      })
      .catch(done);
  });

  it('should be able to handle any number of arguments ', (done) => {
    axios.get
      .onFirstCall()
      .resolves({ data: 100 })
      .onSecondCall()
      .resolves({ data: 200 })
      .onThirdCall()
      .resolves({ data: 300 });

    getConfig([cashInUrl, cashOutNatUrl, cashOutLegUrl])
      .then((results) => {
        expect(axios.get).to.have.been.calledThrice;
        expect(results[cashInUrl]).to.be.eq(100);
        expect(results[cashOutNatUrl]).to.be.eq(200);
        expect(results[cashOutLegUrl]).to.be.eq(300);
        done();
      })
      .catch(done);
  });
});

describe('getAccumulatedAmount function', () => {
  afterEach(() => mockCache.close());
  const mockOperations = [
    {
      operationAmount: 100,
      date: '2021-02-08',
      userId: 2,
    },
    {
      operationAmount: 100,
      date: '2021-02-08',
      userId: 1,
    },
    {
      operationAmount: 100,
      date: '2021-02-09',
      userId: 2,
    },
    {
      operationAmount: 100,
      date: '2021-02-10',
      userId: 2,
    },
  ];

  it('should start accumulation for new user and return zero', () => {
    const operationAmount = 2000;
    const date = '2021-01-05';
    const userId = 100;

    const accumulatedAmount = getAccumulatedAmount(operationAmount, date, userId, mockCache);
    const { trackedAmount } = mockCache.take(userId);
    expect(accumulatedAmount).to.be.eq(0);
    expect(trackedAmount).to.be.eq(operationAmount);
  });

  it('should sum up operation amounts within a week and return accumulated ammount', () => {
    let accumulatedAmount; // last in the loop
    mockOperations.forEach(({ operationAmount, date, userId }) => {
      accumulatedAmount = getAccumulatedAmount(operationAmount, date, userId, mockCache);
    });
    expect(accumulatedAmount).to.be.eq(300);
    mockCache.del([1, 2]);
  });

  it('should discard previously accumulated data, return zero, and restart accumulation', () => {
    mockOperations.push({
      operationAmount: 100,
      date: '2021-02-15',
      userId: 2,
    });

    let accumulatedAmount; // last in the loop
    mockOperations.forEach(({ operationAmount, date, userId }) => {
      accumulatedAmount = getAccumulatedAmount(operationAmount, date, userId, mockCache);
    });
    const { trackedAmount } = mockCache.get(2);
    expect(accumulatedAmount).to.be.eq(0);
    expect(trackedAmount).to.be.eq(100);
    mockCache.del([1, 2]);
  });
});

describe('write function', () => {
  it('should format and round up passed in number before it outputs result to stdout', () => {
    const firstVal = write(0.023);
    const secondVal = write(1);
    expect(firstVal).to.be.eq('0.03');
    expect(secondVal).to.be.eq('1.00');
  });
});
