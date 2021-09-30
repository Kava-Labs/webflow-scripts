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
};

const formatCssId = (value, pool) => {
  return `${value}-${pool}`.toUpperCase();
};

const formatPoolName = (pool) => {
  return pool.replace(/\:/gm, '-');
}

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
  const swapRewardPeriods = siteData['incentiveParams'].swap_reward_periods;
  const denomConversions = siteData['denomConversions'];

  let tokensDistributedBySuppliedAssetPerYear = {};
  for (const period of swapRewardPeriods) {
    const coins = {};
    for (const reward of period.rewards_per_second) {
      // 31536000 = seconds in a year
      const coinPerYear = Number(reward.amount) * 31536000 / denomConversions[commonDenomMapper(reward.denom)];

      const coinRewardPerYear = { denom: reward.denom, amount: String(coinPerYear) };

      coins[commonDenomMapper(reward.denom)] = coinRewardPerYear;
    }
    tokensDistributedBySuppliedAssetPerYear[period.collateral_type] =  coins;
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

  for (const denom of denoms) {
    let mappedPrice = mappedPrices[denom];
    let price = { price: 0 };

    if (mappedPrice) {
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

    const factor = denomConversions[formattedNonUsdxDenom];

    const nonUsdxAssetValue = Number(nonUsdxAsset.amount) / factor * prices[formattedNonUsdxDenom].price;
    const usdxAssetValue = Number(usdxAsset.amount) / FACTOR_SIX * prices['usdx'].price;

    coinMap[pool.name] = {
      totalValueLocked: nonUsdxAssetValue + usdxAssetValue,
      totalShares: Number(pool.total_shares)
    };

    return coinMap;
  }, {});

  return coins;
}

const mapCssIds = (pools) => {
  let ids = {};
  ids['TAV'] = 'TAV';

  for (const pool of pools) {
    ids[pool] = {};
    ids[pool].totalValueLocked = formatCssId('tvl', pool);
    ids[pool].rewardApy = formatCssId('rapy', pool);
  }
  return ids;
}

const setTVLAndTAVDisplayValues = async (siteData, cssIds) => {
  const cssIdTAV = cssIds['TAV'];
  const totalValueLockedByPool = siteData['swpPoolData'];

  let totalAssetValue = 0;
  for (const pool in totalValueLockedByPool) {
    let totalValueLocked = 0;
    totalValueLocked += totalValueLockedByPool[pool].totalValueLocked;

    // const totalValueLockedUsd = usdFormatter.format(totalValueLocked);
    const cssIdTVL = cssIds[formatPoolName(pool)].totalValueLocked;
    setDisplayValueById(cssIdTVL, totalValueLocked);

    totalAssetValue += totalValueLockedByPool[pool].totalValueLocked;
  }

  const totalAssetValueUsd = usdFormatter.format(totalAssetValue);
  setDisplayValueById(cssIdTAV, totalAssetValueUsd);
};


const setSwpPrice = async (swpMarketData) => {
  let swpPriceInUSD = 0;
  if (swpMarketData) {
    swpPriceInUSD = swpMarketData.current_price.usd;
  }

  return {
    price: swpPriceInUSD
  };
};

const setRewardApyDisplayValue = async (pools, siteData, cssIds) => {
  const prices = siteData['prices'];
  const swpPoolData = siteData['swpPoolData'];
  const swpRewardsPerYearByPool = siteData['swpRewardsPerYearByPool'];


  for (const pool in swpPoolData) {
    let tvlAmount = 0;
    if (swpPoolData[pool].totalValueLocked) {
      tvlAmount = Number(swpPoolData[pool].totalValueLocked);
    }
    const reward = swpRewardsPerYearByPool[pool];

    const totalSharesPerPool = swpPoolData[pool].totalShares;
    const rewardsPerYearUsd = Number(swpRewardsPerYearByPool[pool]['swp-a'].amount) * prices[commonDenomMapper(reward['swp-a'].denom)].price;

    let rewardsPerShareUsd = 0;
    let totalLiquidityPerShareUsd = 0;
    if (totalSharesPerPool) {
      rewardsPerShareUsd = rewardsPerYearUsd / totalSharesPerPool;
      totalLiquidityPerShareUsd = tvlAmount / totalSharesPerPool;
    }

    let rewardApy = 0;
    if (totalLiquidityPerShareUsd) {
      const rawApy = (rewardsPerShareUsd / totalLiquidityPerShareUsd) * 100;
      const apyWithDollarSign = usdFormatter.format(rawApy);
      rewardApy = formatPercentage(noDollarSign(apyWithDollarSign));
    }

    const cssId = cssIds[formatPoolName(pool)].rewardApy;
    setDisplayValueById(cssId, rewardApy);
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

  const swpMarketJson = await swpMarketResponse.json();
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

  const swpPrice = await setSwpPrice(swpMarketJson.market_data);
  siteData['prices']['swp-a'] = swpPrice;

  const swpPoolData = await mapSwpPoolData(denoms, siteData, swpPoolDataJson);
  siteData['swpPoolData'] = swpPoolData;

  const swpRewardsPerYearByPool = await getRewardsPerYearByPool(siteData);
  siteData['swpRewardsPerYearByPool'] = swpRewardsPerYearByPool;

  await setTVLAndTAVDisplayValues(siteData, cssIds);
  await setRewardApyDisplayValue(pools, siteData, cssIds);

  $(".metric-blur").css("background-color", "transparent");
  $(".metric-blur").addClass('without-after');
  $(".api-metric").css({"display": "block", "text-align": "center"});
}

const main = async () => {
  const denoms = [
    'bnb-a', 'btcb-a', 'busd-a',
    'xrpb-a', 'hard-a', 'usdx',
    'ukava-a', 'swp-a'
  ];

  const pools = [
    'bnb-usdx', 'btcb-usdx', 'busd-usdx',
    'usdx-xrpb', 'hard-usdx',
    'ukava-usdx', 'swp-usdx'
  ];

  await updateDisplayValues(denoms, pools);
  await sleep(30000);
  main();
};

const sleep = (ms = 10000) => { return new Promise(resolve => setTimeout(resolve, ms)); };

main();
