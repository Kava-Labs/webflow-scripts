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

const formatCssId = (value, pool) => {
  // let displayPool;
  // switch(displayPool) {
  //   case 'xrpb-a':
  //     displayDenom = denom.split('b-')[0]
  //     break;
  //   case 'ukava-a':
  //     displayDenom = 'kava'
  //     break;
  //   default:
  //     displayDenom = denom.split('-')[0]
  //     break;
  // }

  return `${value}-${pool}`.toUpperCase();
}

// function formatCoins(coins) {
//   let formattedCoins = {};
//   for (const coin of coins) {
//     formattedCoins[commonDenomMapper(coin.denom)] = { denom: coin.denom, amount: coin.amount }
//   }
//   return formattedCoins;
// }

// //  Todo - helper function that formats pools by removing the '-a' from usdx
// const formatPoolName = (pool) => {
//   return pool.replace(/[-a]/gm, '')
// }

//  Todo helper that finds the non usdx denom in a pool listing
const findNonUsdxTokenInPool = (pool) => {
  const nonUsdxAsset = pool.coins[0].denom !== 'usdx' ? pool.coins[0] : pool.coins[1];
  return nonUsdxAsset;
};

const findUsdxTokenInPool = (pool) => {
  const usdxAsset = pool.coins[0].denom === 'usdx' ? pool.coins[0] : pool.coins[1];
  return usdxAsset;
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
  console.log(cssId, value)

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
  const denomConversions = siteData['denomConversions'];

  const coins = swpPoolDataJson.result.reduce((coinMap, pool) => {
    const nonUsdxAsset = findNonUsdxTokenInPool(pool);
    const usdxAsset = findUsdxTokenInPool(pool);

    const formattedNonUsdxDenom = commonDenomMapper(nonUsdxAsset.denom);

    const factor = denomConversions[formattedNonUsdxDenom]

    const nonUsdxAssetValue = nonUsdxAsset.amount / factor * prices[formattedNonUsdxDenom].price;
    const usdxAssetValue = Number(usdxAsset.amount) / FACTOR_SIX * prices['usdx'].price

    coinMap[pool.name] = {
      totalValueLocked: nonUsdxAssetValue + usdxAssetValue
    };

    return coinMap;
  }, {});

  return coins;
}

const mapCssIds = (pools) => {
  let ids = {}
  // total asset value
  ids['TAV'] = 'TAV';

  // for the market overview table
  for (const pool of pools) {
    ids[pool] = {};
    ids[pool].totalValueLocked = formatCssId('tvl', pool);
    ids[pool].rewardApy = formatCssId('rapy', pool);
  }
  return ids;
}

//  todo - when these are tested, refactor into single function that sets both
//  tav and tvl ids in one pass through the tVLBP
//  sum of all assets in all pools
const setTotalAssetValueDisplayValue = async (siteData, cssIds) => {
  const cssId = cssIds['TAV'];
  const totalValueLockedByPool = siteData['swpPoolData'];

  let totalAssetValue = 0;
  for (const pool in totalValueLockedByPool) {
    totalAssetValue += totalValueLockedByPool[pool].totalValueLocked;
  }
  const totalAssetValueUsd = usdFormatter.format(totalAssetValue);
  setDisplayValueById(cssId, totalAssetValueUsd);
};

//  sum of assets in individual pools
const setTotalValueLockedDisplayValue = async (siteData, cssIds) => {
  const totalValueLockedByPool = siteData['swpPoolData'];

  for (const pool in totalValueLockedByPool) {
    let totalValueLocked = 0;
    totalValueLocked += totalValueLockedByPool[pool].totalValueLocked;

    const totalValueLockedUsd = usdFormatter.format(totalValueLocked);
    // const cssId = cssIds[[totalValueLockedByPool[pool]]['totalValueLocked']];
    const cssId = cssIds[pool].totalValueLocked;

    setDisplayValueById(cssId, totalValueLockedUsd);
  }
};

const setSwpPrice = async (swpMarketJson) => {
  const swpPriceInUSD = swpMarketJson.market_data.current_price.usd;

  return {
    price: swpPriceInUSD
  };
};

const setRewardApyDisplayValue = async (pools, siteData, cssIds) => {
  const prices = siteData['prices'];
  const denomConversions = siteData['denomConversions'];
  const totalValueLockedPerPool = siteData['swpPoolData'];
  const swpRewardsPerYearByPool = siteData['swpRewardsPerYearByPool']

  for (const pool of pools) {
    const nonUsdxAsset = pool.split(':')[0] !== 'usdx' ? pool.split(':')[0] : pool.split(':')[1];
    // const nonUsdxAsset = findNonUsdxTokenInPool(pool);
    const suppliedDenomPrice = prices[commonDenomMapper(nonUsdxAsset)].price;
    let tvlAmount = 0;
    if (totalValueLockedPerPool[pool]) {
      tvlAmount= Number(totalValueLockedPerPool[pool].totalValueLocked)
    }
    const balanceCurrency = tvlAmount / denomConversions[nonUsdxAsset];
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
    const cssId = cssIds[pool].rewardApy;
    setDisplayValueById(cssId, apy)
  }
};

const updateDisplayValues = async(denoms, pools) => {
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
  const cssIds = mapCssIds(pools);

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
  console.log(cssIds)

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
    'bnb:usdx', 'btcb:usdx', 'busd:usdx',
    'usdx:xrpb', 'hard:usdx',
    'ukava:usdx', 'swp:usdx'
  ];

  await updateDisplayValues(denoms, pools);
  await sleep(30000);
  main();
};

const sleep = (ms = 10000) => { return new Promise(resolve => setTimeout(resolve, ms)); };

main();
