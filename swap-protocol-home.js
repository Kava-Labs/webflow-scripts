const FACTOR_SIX = Number(10 ** 6);
const FACTOR_EIGHT = Number(10 ** 8);
const BASE_URL = "https://api.kava.io";

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const isKavaNativeAsset = (denom) => {
  return ['ukava-a', 'usdx', 'hard', 'ukava', 'hard-a', 'swp-a'].includes(denom);
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

const getRewardsPerYearByPool = async (siteData) => {
  const incentiveParams = siteData['incentiveParams'];
  const swapData = incentiveParams.swap_reward_periods;
  let tokensDistributedBySuppliedAssetPerYear = {};
  const denomConversions = siteData['denomConversions'];
  for (const period of swapData) {
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

const mapSwpPoolData =  (denoms, siteData, swpPoolDataJson) => {
  const prices = siteData['prices'];

  let usdxAmount = 0;

  const coins = swpPoolDataJson.result.reduce((coinMap, pool) => {
    const nonUsdxAsset = pool.coins[0].denom !== 'usdx' ? pool.coins[0] : pool.coins[1];
    const usdxAsset = pool.coins[0].denom === 'usdx' ? pool.coins[0] : pool.coins[1];

    const formattedNonUsdxDenom = commonDenomMapper(nonUsdxAsset.denom);
    const factor = isKavaNativeAsset(formattedNonUsdxDenom) ? FACTOR_SIX : FACTOR_EIGHT;

    coinMap[formattedNonUsdxDenom] = {
      denom: formattedNonUsdxDenom,
      amount: Number(nonUsdxAsset.amount) / factor,
      value: Number(nonUsdxAsset.amount) / factor * prices[formattedNonUsdxDenom].price
    };

    coinMap.usdx = {
      denom: 'usdx',
      amount: usdxAmount += (Number(usdxAsset.amount) / FACTOR_SIX),
      value: usdxAmount * prices['usdx'].price
    }

    return coinMap;
  }, {});

  return coins;
}

const mapCssIds = (denoms) => {
  let ids = {}
  // total asset value
  ids['TAV'] = 'TAV';

  // for the market overview table
  for (const denom of denoms) {
    ids[denom] = {};
    ids[denom].totalValueLocked = formatCssId('tvl', denom);
    ids[denom].rewardApy = formatCssId('rapy', denom);
  }
  return ids;
}

// const setTotalAssetValueDisplayValue = async (siteData, cssIds) => {
//   //  pull data from siteData
//
//   let totalAssetValue = 0;
//   for (const coin in balances) {
//     const currencyAmount = Number(balances[coin].amount)/ denomConversions[coin];
//     const price = prices[coin].price;
//     totalAssetValue += Number(currencyAmount * price);
//   }
//   const totalAssetValueUsd = usdFormatter.format(totalAssetValue);
//   setDisplayValueById(cssId, totalAssetValueUsd);
// }
//
// const setTotalValueLockedDisplayValue = async (siteData, cssIds) => {
//   //  pull data from siteData
//   //  loop through denoms
//   //  format data in USD
//   const totalValueLockedUsd = usdFormatter.format(totalAssetValue);
//
//   setDisplayValueById(cssId, totalValueLockedUsd);
//
// }

const setSwpPrice = async (swpMarketJson) => {
  const swpPriceInUSD = swpMarketJson.market_data.current_price.usd;

  return {
    price: swpPriceInUSD
  };
};

const setRewardApyDisplayValue = async (pools, siteData, cssIds) => {
  //  pull data from siteData (swpLiquidityRewardsPerYearByDenom)
  const swpRewardsPerYearByPool = siteData['swpRewardsPerYearByPool']
  const prices = siteData['prices'];

  for (const pool of pools) {
    const suppliedDenomPrice = prices[denom].price;
    let balanceAmount = 0;
    if (balances[denom]) {
      balanceAmount= Number(balances[denom].amount)
    }
    const balanceCurrency = balanceAmount / denomConversions[denom];
    const reward = swpRewardsPerYearByPool[pool];

    let numerator = 0;
    for (const rewardDenom in reward) {
      const denomPrice = prices[rewardDenom].price;
      numerator += Number(reward[rewardDenom].amount) * denomPrice;
    }
    const denominator = balanceCurrency * suppliedDenomPrice;
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

const updateDisplayValues = async(denoms) => {
  const [
    pricefeedResponse,
    incentiveParametersResponse,
    swpMarketResponse,
    swpPoolsResponse,
  ] = await Promise.all([
    fetch(`${BASE_URL}/pricefeed/prices`),
    fetch(`${BASE_URL}/incentive/parameters`),
    fetch('https://api.coingecko.com/api/v3/coins/kava-swap'),
    fetch(`${BASE_URL}/swap/pools`),
  ]);

  const swpMarketDataJson = await swpMarketResponse.json();
  const swpPoolDataJson = await swpPoolsResponse.json();


  let siteData = {};
  const cssIds = mapCssIds(denoms);

  const pricefeedPrices = await pricefeedResponse.json();
  const incentiveParamsJson = await incentiveParametersResponse.json();

  const prices = await mapPrices(denoms, pricefeedPrices.result);
  siteData['prices'] = prices;

  const denomConversions = setConversionFactors(denoms);
  siteData['denomConversions'] = denomConversions;

  const incentiveParams = await incentiveParamsJson.result;
  siteData['incentiveParams'] = incentiveParams;

  const swpPrice = await setSwpPrice(swpMarketDataJson);
  siteData['prices']['swp-a'] = swpPrice;

  const swpPoolData = await mapSwpPoolData(denoms, siteData, swpPoolDataJson)
  siteData['swpPoolData'] = swpPoolData

  const swpRewardsPerYearByPool = await getRewardsPerYearByPool(siteData);
  siteData['swpRewardsPerYearByPool'] = swpRewardsPerYearByPool;

  console.log(siteData)

  // set display values in ui
  await setTotalAssetValueDisplayValue(siteData, cssIds);
  await setTotalValueLockedDisplayValue(siteData, cssIds);
  await setRewardApyDisplayValue(pools, siteData, cssIds);

  $(".metric-blur").css("background-color", "transparent")
  $(".metric-blur").addClass('without-after');
  $(".api-metric").css({"display": "block", "text-align": "center"})
}

const main = async () => {
  const denoms = [
    'bnb-a', 'btcb-a', 'busd-a',
    'xrpb-a', 'hard-a', 'usdx',
    'ukava-a', 'swp-a'
  ];

  const pools = [
    'bnb:usdx-a', 'btcb:usdx-a', 'busd:usdx-a',
    'usdx-a:xrpb', 'hard:usdx-a',
    'ukava:usdx-a', 'swp:usdx-a'
  ];
  await updateDisplayValues(denoms);
  await sleep(30000);
  main();
};

const sleep = (ms = 10000) => { return new Promise(resolve => setTimeout(resolve, ms)); };

main();
