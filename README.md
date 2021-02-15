# Situation
Users of the financial app can go to a branch to cash in and/or cash out from their online account. There are commission fees for both cash in and cash out operations. Only supported currency is EUR.

# Program
- As a single argument program accepts a path to the input file.
- Program outputs result to stdout.
- Programe is listening to changes to the file.
- Result: calculated commission fees for each operation.

## Commission Fees
Fees depend on the type of transaction

#### Cash In
Commission fee - 0.03% from total amount, but no more than 5.00 EUR.

#### Cah out
There are different commission fees for cash out for natural and legal persons.

##### Natural Persons
Default commission fee - 0.3% from cash out amount.
1000.00 EUR per week (from monday to sunday) is free of charge.
If total cash out amount is exceeded - commission is calculated only from exceeded amount (that is, for 1000.00 EUR there is still no commission fee).

##### Legal persons
Commission fee - 0.3% from amount, but not less than 0.50 EUR for operation.

# System
To start the program, you should
- have Node installed;
- install all dependencies;
- Run the start script passing the path argument to local input file. Path should be relative to the task's root folder;

```console
npm start ./path-to-your/file.json
```

- once the program is ranning, it will be watching the local file to detect changes. To stop listening click "ctrl+c"

## Test Suite

Run test:

```console
npm test
```

Run test and check the coverage

```console
npm test-coverage
```

## Syle guide
Check the compatibility with Airbnb style guide

```console
npm run lint file-name.js
```

