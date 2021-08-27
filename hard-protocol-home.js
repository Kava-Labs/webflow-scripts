const FACTOR_SIX = Number(10 ** 6);
const FACTOR_EIGHT = Number(10 ** 8);
const BASE_URL = "https://api.internal-testnet.kava.io";

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
    } else {
      denomConversions[denom] = FACTOR_EIGHT;
    }
  }
  return denomConversions;
}

const noDollarSign = (value) => {
  return value.slice(1, value.length);
}

const displayInMillions = (value) => {
  const valueInMil = value/FACTOR_SIX;
  const valueInMilUsd = usdFormatter.format(valueInMil);
  return valueInMilUsd + "M";
}

const displayInThousands = (value) => {
  const valueInK = value/Number(10 ** 3);
  const valueInKUsd = usdFormatter.format(valueInK);
  return valueInKUsd + "K";
}

const formatCssId = (value, denom) => {
  let displayDenom;
  switch(denom) {
    case 'xrpb-a':
      displayDenom = denom.split('b-')[0]
      break;
    case 'ukava-a':
      displayDenom = 'kava'
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
  return value +"%";
};

const getModuleBalances = async (hardAccounts) => {
  const hardAccountCoins = hardAccounts.find(a => a.value.name === 'hard').value.coins;
  const coins = {};
  for (const coin of hardAccountCoins) {
    coins[commonDenomMapper(coin.denom)] = { denom: coin.denom, amount: coin.amount };
  }
  return coins;
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
      tokensDistributedBySuppliedAssetPerYear[commonDenomMapper(period.collateral_type)] =  coins;
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
  if(hardData) {
    for(const rp of hardData) {
      const startTime = Date.parse(rp.start);
      const currentTime = Date.now();
      const msDuration = currentTime - startTime;
      const secDuration = msDuration/1000;
      const hardReward = rp.rewards_per_second.find(d => d.denom === 'hard');

      let rewardsDistToDate = 0;
      if(hardReward) {
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
  let formattedDenom;
  switch(denom.toLowerCase()) {
    case 'btc':
      formattedDenom = 'btcb-a';
      break;
    case 'usdx':
      formattedDenom = denom;
      break;
    case 'kava':
      formattedDenom = 'ukava-a';
      break;
    case 'xrp':
      formattedDenom = 'xrpb-a';
      break;
    default:
      formattedDenom = denom + '-a';
      break;
  }
  return formattedDenom;
}

const mapPrices = async (denoms, pricefeedResult) => {
  // for now drop any of the usd:30 prices returned
  const nonThirtyPrices = pricefeedResult.filter(p => !p.market_id.includes('30'));
  let prices = {};

  let mappedPrices = {};
  for (const price of nonThirtyPrices) {
    const priceName = price.market_id.split(":")[0];
    mappedPrices[commonDenomMapper(priceName)] = { price: Number(price.price)};

    // hbtc doesn't have it's own price, it just uses btc's price
    if (commonDenomMapper(priceName) === 'btcb-a') {
      mappedPrices['hbtc-a'] = { price: Number(price.price)};
    }
  }

  for ( const denom of denoms) {
    let mappedPrice = mappedPrices[denom];
    let price = { price: 0 };

    if(mappedPrice) {
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
  const balances = siteData['hardAccount'];
  const prices = siteData['prices'];
  const denomConversions = siteData['denomConversions'];


  let totalAssetValue = 0;
  for (const coin in balances) {
    const currencyAmount = Number(balances[coin].amount)/ denomConversions[coin];
    const price = prices[coin].price;
    totalAssetValue += Number(currencyAmount * price);
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
  for (const denom of denoms) {
    const suppliedHard = hardTotalSupplied[denom];
    const suppliedHardAmount = suppliedHard ? Number(suppliedHard.amount) : 0;
    const cssId = cssIds[denom]['totalSupplied'];
    const currencyValue = suppliedHardAmount / denomConversions[denom];

    const usdValue = currencyValue * prices[denom].price;
    const denomTotalSupplied = displayInMillions(usdValue);
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
      balanceAmount= Number(balances[denom].amount)
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

    if (denominator !==0) {
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
    const apy = interestRates[denom] ? interestRates[denom] : '0.00' ;
    const cssId = cssIds[denom].supplyApy;
    const formattedAPY = formatPercentage((noDollarSign(apy) * 100).toFixed(2));
    setDisplayValueById(cssId, formattedAPY);
  }
};

const updateDisplayValues = async(denoms) => {
  const [
    pricefeedResponse,
    hardAccountResponse,
    hardTotalSuppliedResponse,
    hardTotalBorrowedResponse,
    incentiveParametersResponse,
    hardInterestRatesResponse
  ] = await Promise.all([
    fetch(`${BASE_URL}/pricefeed/prices`),
    fetch(`${BASE_URL}/hard/accounts`),
    fetch(`${BASE_URL}/hard/total-deposited`),
    fetch(`${BASE_URL}/hard/total-borrowed`),
    fetch(`${BASE_URL}/incentive/parameters`),
    fetch(`${BASE_URL}/hard/interest-rate`)
  ]);

  let siteData = {};
  const cssIds = mapCssIds(denoms);

  const pricefeedPrices = await pricefeedResponse.json();
  const hardAccountJson = await hardAccountResponse.json();
  const hardTotalSuppliedJson = await hardTotalSuppliedResponse.json();
  const hardTotalBorrowedJson = await hardTotalBorrowedResponse.json();
  const incentiveParamsJson = await incentiveParametersResponse.json();
  const hardInterestRateJson = await hardInterestRatesResponse.json();

//  Feed this into siteData
  const prices = await mapPrices(denoms, pricefeedPrices.result);
  siteData['prices'] = prices;

  const denomConversions = setConversionFactors(denoms);
  siteData['denomConversions'] = denomConversions;

  const hardAccount = await getModuleBalances(hardAccountJson.result);
  siteData['hardAccount'] = hardAccount;

  const hardTotalSupplied = formatCoins(hardTotalSuppliedJson.result);
  siteData['hardTotalSupplied'] = hardTotalSupplied;

  const hardTotalBorrowed = formatCoins(hardTotalBorrowedJson.result);
  siteData['hardTotalBorrowed'] = hardTotalBorrowed;

  const incentiveParams = await incentiveParamsJson.result;
  siteData['incentiveParams'] = incentiveParams;

  const interestRates = await mapHardSupplyInterestRates(hardInterestRateJson.result);
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

  $(".metric-blur").css("background-color", "transparent")
  $(".metric-blur").addClass('without-after');
  $(".api-metric").css({"display": "block", "text-align": "center"})
}

const main = async () => {
  const denoms = [
    'bnb-a', 'btcb-a', 'busd-a',
    'xrpb-a', 'hard-a', 'usdx',
    'ukava-a'
  ];
  await updateDisplayValues(denoms);
  await sleep(30000);
  main();
};

const sleep = (ms = 10000) => { return new Promise(resolve => setTimeout(resolve, ms)); };

main();
