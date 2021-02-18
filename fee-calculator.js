const { cashInUrl, cashOutNatUrl, cashOutLegUrl } = require('./utils.js');

class Calculator {
  constructor(config) {
    this.config = config;
  }

  getCashInFee(operationAmount) {
    const maxFee = this.config[cashInUrl].max.amount;
    const { percents } = this.config[cashInUrl];
    const fee = (operationAmount * percents) / 100;
    return fee < maxFee ? fee : maxFee;
  }

  getCashOutFee(operationAmount, userType, accumulatedAmount) {
    if (userType === 'juridical') {
      const minFee = this.config[cashOutLegUrl].min.amount;
      const { percents } = this.config[cashOutLegUrl];
      const fee = (operationAmount * percents) / 100;
      return fee > minFee ? fee : minFee;
    }

    if (userType === 'natural') {
      const { percents, week_limit: weekLimit } = this.config[cashOutNatUrl];
      // limit not reached
      if (accumulatedAmount + operationAmount <= weekLimit.amount) return 0;
      // limit was reached
      if (accumulatedAmount >= weekLimit.amount) return (operationAmount * percents) / 100;
      // limit will be reached
      return (((accumulatedAmount + operationAmount) % weekLimit.amount) * percents) / 100;
    }

    return process.stdout.write(`usertype ${userType}, is beyond the scope of this program\n`);
  }
}

module.exports = Calculator;
