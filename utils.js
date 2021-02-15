const axios = require('axios');
const getWeek = require('date-fns/getWeek');

const cashInUrl = 'https://private-00d723-paysera.apiary-proxy.com/cash-in';
const cashOutNatUrl = 'https://private-00d723-paysera.apiary-proxy.com/cash-out-natural';
const cashOutLegUrl = 'https://private-00d723-paysera.apiary-proxy.com/cash-out-juridical';

const getConfig = async (urlArr) => {
  const configs = {};
  try {
    // make concurent requests to save time
    const results = await Promise.all(urlArr.map((url) => axios.get(url)));

    // assign urls as keys to corresponding results
    results.forEach((result, index) => Object.assign(configs, { [urlArr[index]]: result.data }));
  } catch (error) {
    process.stdout.write(`${error}\n`);
    process.exit();
  }
  return configs;
};

const getAccumulatedAmount = (amount, date, userId, cache) => {
  const currentWeek = getWeek(new Date(date), { weekStartsOn: 1 });
  const cachedData = cache.get(userId);
  let accumulatedAmount = 0;

  // initiate accumulation for a new user
  if (cachedData === undefined) cache.set(userId, { week: currentWeek, trackedAmount: amount });

  // cache operation of an existing user in same week
  if (cachedData && currentWeek === cachedData.week) {
    accumulatedAmount = cachedData.trackedAmount + amount;
    cache.set(userId, { week: cachedData.week, trackedAmount: accumulatedAmount });
  }

  // reset accumulation if an operation took place during a new week
  if (cachedData && currentWeek !== cachedData.week) {
    cache.del(userId);
    cache.set(userId, { week: currentWeek, trackedAmount: amount });
  }

  return accumulatedAmount;
};

const write = (fee) => {
  const roundedUpFee = (Math.ceil(fee * 100) / 100).toFixed(2);
  if (process.env.NODE_ENV !== 'test') process.stdout.write(`${roundedUpFee}\n`);
  return roundedUpFee;
};

module.exports = {
  getConfig,
  getAccumulatedAmount,
  write,
  cashInUrl,
  cashOutNatUrl,
  cashOutLegUrl,
};
