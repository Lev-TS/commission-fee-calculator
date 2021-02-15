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
    // if userType is natural person
    const { percents, week_limit: weekLimit } = this.config[cashOutNatUrl];
    // limit not riched
    if (accumulatedAmount + operationAmount <= weekLimit.amount) return 0;
    // limit was riched
    if (accumulatedAmount >= weekLimit.amount) return (operationAmount * percents) / 100;
    // limit will be riched
    return (((accumulatedAmount + operationAmount) % weekLimit.amount) * percents) / 100;
  }
}

module.exports = Calculator;
