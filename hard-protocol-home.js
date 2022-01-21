const FACTOR_SIX = Number(10 ** 6);
const FACTOR_EIGHT = Number(10 ** 8);
const BASE_URL = "https://api2.kava.io";


// TODO add other denoms here as they become available 
const ibcDenoms = {
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2": "uatom-a",
  // TODO 
  // "ibc/.": "uakt-a", 
  // "ibc/..": "luna-a",
  // "ibc/...":"uosmo-a",
};

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const isKavaNativeAsset = (denom) => {
  return ['ukava-a', 'usdx', 'hard', 'ukava', 'hard-a'].includes(denom);
}

const setConversionFactors = (denoms) => {
  const denomConversions = {};
  for (const denom of denoms) {
    if (isKavaNativeAsset(denom)) {
      denomConversions[denom] = FACTOR_SIX;
    } else if (denom === "uatom-a"){
      denomConversions[denom] = FACTOR_SIX;
    } 
    else {
      denomConversions[denom] = FACTOR_EIGHT;
    }
  }
  return denomConversions;
}

const noDollarSign = (value) => {
  return value.slice(1, value.length);
}

const displayInMillions = (value) => {
  const valueInMil = value / FACTOR_SIX;
  const valueInMilUsd = usdFormatter.format(valueInMil);
  return valueInMilUsd + "M";
}

const displayInThousands = (value) => {
  const valueInK = value / Number(10 ** 3);
  const valueInKUsd = usdFormatter.format(valueInK);
  return valueInKUsd + "K";
}

const formatCssId = (value, denom) => {
  let displayDenom;
  switch (denom) {
    case 'xrpb-a':
      displayDenom = denom.split('b-')[0]
      break;
    case 'ukava-a':
      displayDenom = 'kava'
      break;
    case 'uatom-a':
      displayDenom = 'ATOM';
      break;
    default:
      displayDenom = denom.split('-')[0]
      break;
  }

  return `${value}-${displayDenom}`.toUpperCase();
}

function formatCoins(coins) {
  let formattedCoins = {};
  for (const coin of coins) {
    formattedCoins[commonDenomMapper(coin.denom)] = { denom: coin.denom, amount: coin.amount }
  }
  return formattedCoins;
}

const formatPercentage = (value) => {
  return value + "%";
};

const getRewardPerYearByDenom = async (siteData) => {
  const incentiveParams = siteData['incentiveParams'];
  const hardData = incentiveParams.hard_supply_reward_periods;
  let tokensDistributedBySuppliedAssetPerYear = {};
  const denomConversions = siteData['denomConversions'];
  for (const period of hardData) {
    const coins = {};
    for (const reward of period.rewards_per_second) {
      // 31536000 = seconds in a year
      const coinPerYear = Number(reward.amount) * 31536000 / denomConversions[commonDenomMapper(reward.denom)];

      const coinRewardPerYear = { denom: reward.denom, amount: String(coinPerYear) };

      coins[commonDenomMapper(reward.denom)] = coinRewardPerYear;
    }
    tokensDistributedBySuppliedAssetPerYear[commonDenomMapper(period.collateral_type)] = coins;
  }
  return tokensDistributedBySuppliedAssetPerYear;
}

const mapHardSupplyInterestRates = async (interestRates) => {
  const supplyApys = {};
  for (const interestRate of interestRates) {
    supplyApys[commonDenomMapper(interestRate['denom'])] = interestRate['supply_interest_rate'];
  }
  return supplyApys;
};

const getTotalHardAvailable = async (hardData) => {
  let totalHardDist = 0;
  if (hardData) {
    for (const rp of hardData) {
      const startTime = Date.parse(rp.start);
      const currentTime = Date.now();
      const msDuration = currentTime - startTime;
      const secDuration = msDuration / 1000;
      const hardReward = rp.rewards_per_second.find(d => d.denom === 'hard');

      let rewardsDistToDate = 0;
      if (hardReward) {
        rewardsDistToDate = secDuration * Number(hardReward.amount);
      }

      totalHardDist += rewardsDistToDate;
    }
  }
  return totalHardDist / FACTOR_SIX;
}

const setDisplayValueById = (cssId, value) => {
  const element = document.getElementById(cssId)
  if (element) { element.innerHTML = value; }
}

const commonDenomMapper = (denom) => {
  const commonDenoms = {
    "btc": "btcb-a",
    "uatom-a": "uatom-a",
    "usdx": "usdx",
    "kava": "ukava-a",
    "xrp": "xrpb-a",
  };
  const commonDenom = commonDenoms[denom];
  if (commonDenom) {
    return commonDenom;
  }
  return denom + '-a';
}


const ibcDenomMapper = (denom) => {
  if (!denom.includes("ibc")) {
    return denom;
  };

  if (ibcDenoms.hasOwnProperty(denom)) {
    return ibcDenoms[denom];
  };
};

const normalizeDenoms = (denomsList) => {
  const readableDenoms = [];
  for (let d of denomsList) {
    if (d.denom.includes('ibc')) {
      const parsedDenom = ibcDenomMapper(d.denom);
      readableDenoms.push({ ...d, denom: parsedDenom })
    } else {
      readableDenoms.push(d);
    }
  }
  return readableDenoms;
};

// 
const normalizeCollateralTypes = (params, isPool = false) => {
  const readableParams = [];
  for (const param of params) {
    if (param.collateral_type.includes("ibc")) {
      let readableCollateralType;
      if (isPool) {
        readableCollateralType = ibcDenomMapper(param.collateral_type.split(":")[0]) + ":usdx";
      }
      else {
        readableCollateralType = ibcDenomMapper(param.collateral_type);
      }
      readableParams.push({ ...param, collateral_type: readableCollateralType });
    }
    // keep as is 
    else {
      readableParams.push(param);
    };
  };

  return readableParams;
};


const mapPrices = async (denoms, pricefeedResult) => {
  // for now drop any of the usd:30 prices returned
  const nonThirtyPrices = pricefeedResult.filter(p => !p.market_id.includes('30'));
  let prices = {};

  let mappedPrices = {};
  for (const price of nonThirtyPrices) {
    const priceName = price.market_id.split(":")[0];
    mappedPrices[commonDenomMapper(priceName)] = { price: Number(price.price) };

    // hbtc doesn't have it's own price, it just uses btc's price
    if (commonDenomMapper(priceName) === 'btcb-a') {
      mappedPrices['hbtc-a'] = { price: Number(price.price) };
    }
  }

  for (const denom of denoms) {
    let mappedPrice = mappedPrices[denom] || mappedPrices[denom.slice(1)];
    let price = { price: 0 };

    if (mappedPrice) {
      price = { price: mappedPrice.price };
    }
    prices[denom] = price;
  }
  return prices;
};

const mapCssIds = (denoms) => {
  let ids = {}
  // total asset value
  ids['TAV'] = 'TAV';

  // total HARD Distributed
  ids['total-hard-dist'] = 'TOTAL-HARD-DISTRIBUTED';

  // for the market overview table
  for (const denom of denoms) {
    ids[denom] = {};
    ids[denom].totalBorrowed = formatCssId('tb', denom);
    ids[denom].totalSupplied = formatCssId('tl', denom);
    ids[denom].rewardApy = formatCssId('rapy', denom);
    ids[denom].supplyApy = formatCssId('sapy', denom);
  }
  
  return ids;
}

const setTotalAssetValueDisplayValue = async (siteData, cssIds) => {
  const cssId = cssIds['TAV'];
  const suppliedBalances = siteData['hardTotalSupplied'];
  const borrowedBalances = siteData['hardTotalBorrowed'];
  const prices = siteData['prices'];
  const denomConversions = siteData['denomConversions'];

  let totalAssetValue = 0;
  for (const coin in suppliedBalances) {
    // fallback values
    let denomConvFactor = FACTOR_EIGHT;
    let suppliedCurrencyAmount = 0;
    let borrowedCurrencyAmount = 0;
    let price = 0;

    // try to find denom conversion 
    if (denomConversions[coin]) {
      denomConvFactor = denomConversions[coin];
    }
    else {
      console.warn(`${coin} not found in conversions object, falling back to factor 8`);
    }

    // try to find supplied Balances 
    if (suppliedBalances[coin]) {
      suppliedCurrencyAmount = Number(suppliedBalances[coin].amount) / denomConvFactor;
    }
    else {
      console.warn(`${coin} not found in suppliedBalances object, falling back to zero`);
    }

    // try to find borrowed Balances 
    if (borrowedBalances[coin]) {
      borrowedCurrencyAmount = Number(borrowedBalances[coin].amount) / denomConvFactor;
    }
    else {
      console.warn(`${coin} not found in borrowedBalances object, falling back to zero`);
    }
    // try to find price 
    if (prices[coin]) {
      price = prices[coin].price;
    }
    else {
      console.warn(`${coin} not found in prices object, falling back to price of zero`);
    }
    // add to total assets, if anything wasn't found it will simply add zero, and warn in the console, this will never
    // cause totalAssets to be NaN 
    totalAssetValue += (suppliedCurrencyAmount + borrowedCurrencyAmount) * price;
  }
  const totalAssetValueUsd = usdFormatter.format(totalAssetValue);
  setDisplayValueById(cssId, totalAssetValueUsd);
}

const setTotalHardDistributedDisplayValue = async (siteData, cssIds) => {
  const rawTotalHardDist = siteData["totalHardSupplyRewardsDistributed"] + siteData["totalHardBorrowRewardsDistributed"];
  const prices = siteData['prices'];
  const cssId = cssIds['total-hard-dist'];
  const displayTotalHardDist = usdFormatter.format(rawTotalHardDist * prices['hard-a'].price);
  setDisplayValueById(cssId, displayTotalHardDist);
}

const setTotalSuppliedDisplayValues = async (denoms, siteData, cssIds) => {
  const hardTotalSupplied = siteData['hardTotalSupplied'];
  const prices = siteData['prices'];
  const denomConversions = siteData['denomConversions'];
  console.log(hardTotalSupplied)
  for (const denom of denoms) {
    const suppliedHard = hardTotalSupplied[denom];
    const suppliedHardAmount = suppliedHard ? Number(suppliedHard.amount) : 0;
    const cssId = cssIds[denom]['totalSupplied'];
    const currencyValue = suppliedHardAmount / denomConversions[denom];

    const usdValue = currencyValue * prices[denom].price;
    const denomTotalSupplied = usdValue > 1000000 ? displayInMillions(usdValue) : displayInThousands(usdValue);
    setDisplayValueById(cssId, denomTotalSupplied);
  }
};

const setTotalBorrowedDisplayValues = async (denoms, siteData, cssIds) => {
  const hardTotalBorrowed = siteData['hardTotalBorrowed'];
  const prices = siteData['prices'];
  const denomConversions = siteData['denomConversions'];
  for (const denom of denoms) {
    const borrowedHard = hardTotalBorrowed[denom];
    const borrowedHardAmount = borrowedHard ? Number(borrowedHard.amount) : 0
    const cssId = cssIds[denom]['totalBorrowed'];
    const currencyValue = borrowedHardAmount / denomConversions[denom];

    const usdValue = currencyValue * prices[denom].price;
    const denomTotalSupplied = usdValue >= 10 ** 6 ? displayInMillions(usdValue) : displayInThousands(usdValue);
    setDisplayValueById(cssId, denomTotalSupplied);
  }
};

const setRewardApyDisplayValue = async (denoms, siteData, cssIds) => {
  const hardSupplyRewardsPerYearByDenom = siteData['hardSupplyRewardsPerYearByDenom']
  const balances = siteData['hardTotalSupplied'];
  const prices = siteData['prices'];
  const denomConversions = siteData['denomConversions'];
  for (const denom of denoms) {
    const collatDenomPrice = prices[denom].price;
    let balanceAmount = 0;
    if (balances[denom]) {
      balanceAmount = Number(balances[denom].amount)
    }
    const balanceCurrency = balanceAmount / denomConversions[denom];
    const reward = hardSupplyRewardsPerYearByDenom[denom];

    let numerator = 0;
    for (const rewardDenom in reward) {
      const denomPrice = prices[rewardDenom].price;
      numerator += Number(reward[rewardDenom].amount) * denomPrice;
    }
    const denominator = balanceCurrency * collatDenomPrice;
    let apy = '0.00%';

    if (denominator !== 0) {
      // use usdFormatter to truncate to 2 decimals and round
      const apyWithDollarSign = usdFormatter.format((numerator / denominator) * 100);
      apy = formatPercentage(noDollarSign(apyWithDollarSign));
    }
    const cssId = cssIds[denom].rewardApy;
    setDisplayValueById(cssId, apy)
  }
};

const setSupplyApyDisplayValue = async (denoms, siteData, cssIds) => {
  const interestRates = siteData['interestRates'];
  for (const denom of denoms) {
    const apy = interestRates[denom] ? interestRates[denom] : '0.00';
    const cssId = cssIds[denom].supplyApy;
    const formattedAPY = formatPercentage((noDollarSign(apy) * 100).toFixed(2));
    setDisplayValueById(cssId, formattedAPY);
  }
};

const updateDisplayValues = async (denoms) => {
  const [
    pricefeedResponse,
    hardTotalSuppliedResponse,
    hardTotalBorrowedResponse,
    incentiveParametersResponse,
    hardInterestRatesResponse
  ] = await Promise.all([
    fetch(`${BASE_URL}/pricefeed/prices`),
    fetch(`${BASE_URL}/hard/total-deposited`),
    fetch(`${BASE_URL}/hard/total-borrowed`),
    fetch(`${BASE_URL}/incentive/parameters`),
    fetch(`${BASE_URL}/hard/interest-rate`)
  ]);

  let siteData = {};
  const cssIds = mapCssIds(denoms);

  const pricefeedPrices = await pricefeedResponse.json();
  const hardTotalSuppliedJson = await hardTotalSuppliedResponse.json();
  const hardTotalBorrowedJson = await hardTotalBorrowedResponse.json();
  const incentiveParamsJson = await incentiveParametersResponse.json();
  const hardInterestRateJson = await hardInterestRatesResponse.json();

  //  Feed this into siteData
  const prices = await mapPrices(denoms, pricefeedPrices.result);
  siteData['prices'] = prices;

  const denomConversions = setConversionFactors(denoms);
  siteData['denomConversions'] = denomConversions;

  const hardTotalSupplied = formatCoins(normalizeDenoms(hardTotalSuppliedJson.result));
  siteData['hardTotalSupplied'] = hardTotalSupplied;

  const hardTotalBorrowed = formatCoins(normalizeDenoms(hardTotalBorrowedJson.result));
  siteData['hardTotalBorrowed'] = hardTotalBorrowed;

  const incentiveParams = await incentiveParamsJson.result;
  incentiveParams['hard_supply_reward_periods'] = normalizeCollateralTypes(incentiveParams['hard_supply_reward_periods']);
  incentiveParams['hard_borrow_reward_periods'] = normalizeCollateralTypes(incentiveParams['hard_borrow_reward_periods']);
  incentiveParams['swap_reward_periods'] = normalizeCollateralTypes(incentiveParams['swap_reward_periods'], true);
  siteData['incentiveParams'] = incentiveParams;

  const interestRates = await mapHardSupplyInterestRates(normalizeDenoms(hardInterestRateJson.result));
  siteData['interestRates'] = interestRates;

  const rawTotalHardSupplyDist = await getTotalHardAvailable(incentiveParams.hard_supply_reward_periods);
  siteData["totalHardSupplyRewardsDistributed"] = rawTotalHardSupplyDist;

  const rawTotalHardBorrowDist = await getTotalHardAvailable(incentiveParams.hard_borrow_reward_periods);
  siteData["totalHardBorrowRewardsDistributed"] = rawTotalHardBorrowDist;

  const hardSupplyRewardsPerYearByDenom = await getRewardPerYearByDenom(siteData);
  siteData['hardSupplyRewardsPerYearByDenom'] = hardSupplyRewardsPerYearByDenom;

  // set display values in ui
  await setTotalAssetValueDisplayValue(siteData, cssIds);
  await setTotalHardDistributedDisplayValue(siteData, cssIds);
  await setTotalSuppliedDisplayValues(denoms, siteData, cssIds);
  await setTotalBorrowedDisplayValues(denoms, siteData, cssIds);
  await setRewardApyDisplayValue(denoms, siteData, cssIds);
  await setSupplyApyDisplayValue(denoms, siteData, cssIds);
  console.log(siteData)
  $(".metric-blur").css("background-color", "transparent");
  $(".metric-blur").addClass('without-after');
  $(".api-metric").css({ "display": "block", "text-align": "center" });
}

const main = async () => {
  const denoms = [
    'bnb-a', 'btcb-a', 'busd-a',
    'xrpb-a', 'hard-a', 'usdx',
    'ukava-a', 'uatom-a'
    // 'uakt-a', 'luna-a',
    // 'uosmo-a', 'uatom-a'
  ];
  await updateDisplayValues(denoms);
  await sleep(30000);
  main();
};

const sleep = (ms = 10000) => { return new Promise(resolve => setTimeout(resolve, ms)); };

main();
