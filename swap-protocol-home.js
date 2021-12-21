const FACTOR_SIX = Number(10 ** 6);
const FACTOR_EIGHT = Number(10 ** 8);
const BASE_URL = "https://api.testnet.kava.io/";
const SWAP_POOL_URL = 'https://swap-data-testnet.kava.io/v1/pools/internal';
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
const cache = new Map(); 
const ibcDenomMapper = async (denom) => {
  if (!denom.includes("ibc")) return;
  if (cache.has(denom)) {
    return cache.get(denom);  
  };
  const request = await fetch(BASE_URL + 'ibc/apps/transfer/v1/denom_traces/' + denom.replace("ibc/",""));
  const ibcDenom = await request.json();
  cache.set(denom, ibcDenom.denom_trace.base_denom);
  return ibcDenom.denom_trace.base_denom; 
}; 

const normalizeSwpPool = async (swpPoolList) => {
  const readable = []; 
  for (const {name, coins, total_shares} of swpPoolList){
    if (name.includes('ibc')){
      const parsedDenom = await ibcDenomMapper(name.replace(":usdx", "")); 
      const parsedCoins = [];
      // goes over the coins invloved in the swap pool
      for (const {denom, amount} of coins){
        if (denom.includes('ibc')){
          const parsedDenom = await ibcDenomMapper(denom); 
          parsedCoins.push({denom: parsedDenom, amount});
        } else {
            parsedCoins.push({denom, amount});
        }
      };
      // push the human readable swap pool denoms 
      readable.push({name: parsedDenom + ":usdx", coins: parsedCoins, total_shares});
    } else {
      readable.push({name, coins, total_shares});
    }
  };
  return readable;
}; 
const normalizeSwpPoolVolume = async (swpPoolList) => {
  const readable = []; 
  for (const {name, volume} of swpPoolList){
    if (name.includes('ibc')){
      const parsedDenom = await ibcDenomMapper(name.replace(":usdx", "")); 
      const parsedCoins = [];
      // goes over the coins invloved in the swap pool
      for (const {denom, amount} of volume){
        if (denom.includes('ibc')){
          const parsedDenom = await ibcDenomMapper(denom); 
          parsedCoins.push({denom: parsedDenom, amount});
        } else {
            parsedCoins.push({denom, amount});
        }
      };
      // push the human readable swap pool denoms 
      readable.push({name: parsedDenom + ":usdx", volume: parsedCoins});
    } else {
      readable.push({name, volume});
    }
  };
  return readable;
}; 

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
    // || helps when there is a u in front of the ibc denom it will strip the u and look for it 
    let mappedPrice = mappedPrices[denom] || mappedPrices[denom.slice(1)];
    let price = { price: 0 };
    if (mappedPrice) {
      price = { price: mappedPrice.price };
    }
    prices[denom] = price;
  }
  return prices;
};

const normalizeCollateralTypes = async (params, isPool = false) => {
  const readableParams = []; 
  for (const param of params){
    if (param.collateral_type.includes("ibc")){
      let readableCollateralType;
      if (isPool){
        readableCollateralType = await ibcDenomMapper(param.collateral_type.split(":")[0]) + ":usdx";
      } 
      else {
        readableCollateralType = await ibcDenomMapper(param.collateral_type);
      }
    
      readableParams.push({...param, collateral_type: readableCollateralType});
    } else {
      readableParams.push(param); 
    };
  };
  return readableParams; 
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

const getVolumesByPool = (swpPoolVolumeJson, siteData) => {
  const prices = siteData['prices'];
  const denomConversions = siteData['denomConversions'];
  let volumesByPoolInUSD = {};

  for (pool of swpPoolVolumeJson) {
    let totalPoolVolumeInUSD = 0;
    for (coin of pool.volume) {
      const formattedDenom = commonDenomMapper(coin.denom);
      const factor = denomConversions[formattedDenom];

      if (prices[formattedDenom]) {
        totalPoolVolumeInUSD += Number(coin.amount) * prices[formattedDenom].price / factor;
      }

      volumesByPoolInUSD[pool.name] = totalPoolVolumeInUSD;
    }
  }

  return volumesByPoolInUSD;
};

const mapCssIds = (pools) => {
  let ids = {};

  ids['TAV'] = {
    d: 'TAV',
    m: 'TAV-M'
  };

  ids['DV'] = {
    d: 'DV',
    m: 'DV-M'
  };

  for (const pool of pools) {
    ids[pool] = {};

    ids[pool].totalValueLocked = {
      d: formatCssId('tvl', pool),
      m: formatCssId('tvl-m', pool)
    };

    ids[pool].rewardApy = {
        d: formatCssId('rapy', pool),
        m: formatCssId('rapy-m', pool)
      };

    ids[pool].dailyVolume = {
      d: formatCssId('dv', pool),
      m: formatCssId('dv-m', pool)
    };
  }

  return ids;
};

const setTVLAndTAVDisplayValues = async (siteData, cssIds) => {
  const cssIdDesktopTAV = cssIds['TAV']['d'];
  const cssIdMobileTAV = cssIds['TAV']['m'];

  const totalValueLockedByPool = siteData['swpPoolData'];

  let totalAssetValue = 0;
  for (const pool in totalValueLockedByPool) {
    let totalValueLocked = 0;
    totalValueLocked += totalValueLockedByPool[pool].totalValueLocked;

    const totalValueLockedUsd = usdFormatter.format(totalValueLocked);
    const cssIdDesktopTVL = cssIds[formatPoolName(pool)].totalValueLocked['d'];
    const cssIdMobileTVL = cssIds[formatPoolName(pool)].totalValueLocked['m'];
    setDisplayValueById(cssIdDesktopTVL, totalValueLockedUsd);
    setDisplayValueById(cssIdMobileTVL, totalValueLockedUsd);

    totalAssetValue += totalValueLockedByPool[pool].totalValueLocked;
  }

  const totalAssetValueUsd = noDollarSign(usdFormatter.format(totalAssetValue));
  setDisplayValueById(cssIdDesktopTAV, totalAssetValueUsd);
  setDisplayValueById(cssIdMobileTAV, totalAssetValueUsd);
};

const setDailyVolumesDisplayValues = async (siteData, cssIds) => {
  const cssIDDesktopDV = cssIds['DV']['d'];
  const cssIDMobileDV = cssIds['DV']['m'];

  const swpVolumesByPoolInUSD = siteData['swpVolumesByPoolInUSD'];

  let totalDailyVolume = 0;
  for (const pool in swpVolumesByPoolInUSD) {
    let poolVolume = 0;
    poolVolume += swpVolumesByPoolInUSD[pool];

    const poolVolumeUSD = usdFormatter.format(poolVolume);
    const cssIdDailyVolumeDesktop = cssIds[formatPoolName(pool)].dailyVolume['d'];
    const cssIdDailyVolumeMobile = cssIds[formatPoolName(pool)].dailyVolume['m'];
    setDisplayValueById(cssIdDailyVolumeDesktop, poolVolumeUSD);
    setDisplayValueById(cssIdDailyVolumeMobile, poolVolumeUSD);

    totalDailyVolume += poolVolume;
  }

  const totalDailyVolumeInUSD = usdFormatter.format(totalDailyVolume);
  setDisplayValueById(cssIDDesktopDV, totalDailyVolumeInUSD);
  setDisplayValueById(cssIDMobileDV, totalDailyVolumeInUSD);
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

    const cssIdDesktop = cssIds[formatPoolName(pool)].rewardApy['d'];
    const cssIdMobile = cssIds[formatPoolName(pool)].rewardApy['m'];

    setDisplayValueById(cssIdDesktop, rewardApy);
    setDisplayValueById(cssIdMobile, rewardApy);
  }
};

const updateDisplayValues = async(denoms, pools) => {
  const [
    pricefeedResponse,
    incentiveParametersResponse,
    swpMarketResponse,
    swpPoolsResponse,
    swpPoolVolumeResponse,
  ] = await Promise.all([
    fetch(`${BASE_URL}/pricefeed/prices`),
    fetch(`${BASE_URL}/incentive/parameters`),
    fetch('https://api.coingecko.com/api/v3/coins/kava-swap'),
    fetch(`${BASE_URL}/swap/pools`),
    fetch(SWAP_POOL_URL),
  ]);

  const swpMarketJson = await swpMarketResponse.json();
  const swpPoolDataJson = await swpPoolsResponse.json();
  const swpPoolVolumeJson = await swpPoolVolumeResponse.json();

  let siteData = {};
  const cssIds = mapCssIds(pools);

  const pricefeedPrices = await pricefeedResponse.json();
  const incentiveParamsJson = await incentiveParametersResponse.json();
  const prices = await mapPrices(denoms, pricefeedPrices.result);
  siteData['prices'] = prices;

  const denomConversions = setConversionFactors(denoms);
  siteData['denomConversions'] = denomConversions;

  const incentiveParams = incentiveParamsJson.result;
  
  incentiveParams['hard_supply_reward_periods'] = await normalizeCollateralTypes(incentiveParams['hard_supply_reward_periods']);
  incentiveParams['swap_reward_periods'] = await normalizeCollateralTypes(incentiveParams['swap_reward_periods'], true);
  siteData['incentiveParams'] = incentiveParams;


  const swpPrice = await setSwpPrice(swpMarketJson.market_data);
  siteData['prices']['swp-a'] = swpPrice;
  
  const parsedSwpData = await normalizeSwpPool(swpPoolDataJson.result);
  swpPoolDataJson.result = parsedSwpData; 

  const swpPoolData = await mapSwpPoolData(denoms, siteData, swpPoolDataJson);
  siteData['swpPoolData'] = swpPoolData;

  const swpRewardsPerYearByPool = await getRewardsPerYearByPool(siteData);
  siteData['swpRewardsPerYearByPool'] = swpRewardsPerYearByPool;


  const swpVolumesByPoolInUSD = await getVolumesByPool(await normalizeSwpPoolVolume(swpPoolVolumeJson), siteData);
  siteData['swpVolumesByPoolInUSD'] = swpVolumesByPoolInUSD;

  await setTVLAndTAVDisplayValues(siteData, cssIds);
  await setRewardApyDisplayValue(pools, siteData, cssIds);
  await setDailyVolumesDisplayValues(siteData, cssIds);
  
  // $(".metric-blur").css("background-color", "transparent");
  // $(".metric-blur").addClass('without-after');
  // $(".api-metric").css({"display": "block", "text-align": "center"});
}

const main = async () => {
  const denoms = [
    'bnb-a', 'btcb-a', 'busd-a',
    'xrpb-a', 'hard-a', 'usdx',
    'ukava-a', 'swp-a', 'uakt-a',
    'luna-a', 'uosmo-a', 'uatom-a'
  ];

  const pools = [
    'bnb-usdx', 'btcb-usdx', 'busd-usdx',
    'usdx-xrpb', 'hard-usdx', 'uakt-usdx',
    'ukava-usdx', 'swp-usdx', 'luna-usdx',
    'uosmo-usdx', 'uatom-usdx',
  ];

  await updateDisplayValues(denoms, pools);
  await sleep(30000);
  main();
};

const sleep = (ms = 10000) => { return new Promise(resolve => setTimeout(resolve, ms)); };

main();
