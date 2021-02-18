const fs = require('fs');
const NodeCache = require('node-cache');
const path = require('path');

const {
  getConfig,
  write,
  getAccumulatedAmount,
  cashInUrl,
  cashOutNatUrl,
  cashOutLegUrl,
} = require('./utils');
const FeeCalculator = require('./fee-calculator');

// Get a local file path
const args = process.argv.slice(2);
const filePath = path.join(__dirname, args[0]);

const cache = new NodeCache();

// Load existing data and log fees.
fs.readFile(filePath, 'utf8', async (error, content) => {
  // if fails log and exit
  if (error) {
    process.stdout.write(`${error}\n`);
    process.exit();
  }

  // initialise fee calculator
  const config = await getConfig([cashInUrl, cashOutNatUrl, cashOutLegUrl]);
  const calculator = new FeeCalculator(config);

  const printFee = (input) => {
    const {
      type,
      operation: { amount },
      user_id: userId,
      user_type: userType,
      date,
    } = input;
    if (type === 'cash_in') return write(calculator.getCashInFee(amount));
    if (type === 'cash_out') {
      const accumulatedAmount = userType === 'natural' && getAccumulatedAmount(amount, date, userId, cache);
      write(calculator.getCashOutFee(amount, userType, accumulatedAmount));
      return cache.close();
    }

    return process.stdout.write(`operation type "${userType}", is beyond the scope of this program\n`);
  };

  // log out fees for operations that are already in the file
  const initialData = JSON.parse(content);
  initialData.forEach((input) => printFee(input));

  // watch the file for changes
  let dataLength = initialData.length;
  return fs.watchFile(filePath, () => {
    const newData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const newInputs = newData.slice(dataLength);
    dataLength += newInputs.length;
    newInputs.forEach((input) => printFee(input));
  });
});

module.exports = {};
