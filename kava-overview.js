const FACTOR_SIX = Number(10 ** 6);
const FACTOR_EIGHT = Number(10 ** 8);
const BASE_URL = "https://kava4.data.kava.io";

var usdFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

var getKavaPrice = async () => {
  const priceURL = "https://api.binance.com/api/v3/ticker/24hr?symbol=KAVAUSDT";
  const priceResponse = await fetch(priceURL);
  const priceData = await priceResponse.json();
  return { price: priceData.lastPrice, percentChange: priceData.priceChangePercent };
};

var totalLockedAndBorrowedByDenom = async (denom) => {
  let denomCdpsURL = BASE_URL + `/cdp/cdps/collateralType/${denom}`;
  let cdpResponse = await fetch(denomCdpsURL);
  let cdpData = await cdpResponse.json();
  let cdpRes = cdpData && cdpData.result;

  var { collateral, principal, accumulated_fees } = cdpRes.reduce(function(accumulator, item) {
    Object.keys(item.cdp).forEach(function(key) {
      let c = ['collateral', 'principal', 'accumulated_fees'];
      if(c.includes(key)){
        accumulator[key] = Number((accumulator[key] || 0)) + Number(item.cdp[key].amount);
      }
    });
    return accumulator;
  }, {});

  return {
    locked: Number(collateral/FACTOR_EIGHT),
    borrowed: Number(principal/FACTOR_SIX),
    fees: Number(accumulated_fees/FACTOR_SIX)
  }
};

var getCollateralPrice = async (market) => {
  const priceURL = BASE_URL + "/pricefeed/price/" + market;
  const priceResponse = await fetch(priceURL);
  const priceData = await priceResponse.json();
  const priceRes = priceData && priceData.result;
  const price = Number(priceRes.price);
  return price;
}

var usdxDebtLimitByDenom = async (denom) => {
  const usdxLimitURL = BASE_URL + "/cdp/parameters";
  const paramsResponse = await fetch(usdxLimitURL);
  const paramsData = await paramsResponse.json();
  const collateralParams = paramsData.result.collateral_params;

  const denomParams = collateralParams.find(
    (item) => item.type.toUpperCase() === denom.toUpperCase()
  );

  let hasDebtLimit = denomParams && denomParams.debt_limit;
  return hasDebtLimit ? (Number(denomParams.debt_limit.amount)/FACTOR_SIX) : 0
};

var totalAmountOnPlatformByDenom = async (denom) => {
  const supplyURL = BASE_URL + "/bep3/supply/" + denom;
  const supplyResponse = await fetch(supplyURL);
  const supplyData = await supplyResponse.json();
  const supplyRes = supplyData && supplyData.result;
  return Number(supplyRes.current_supply.amount);
};

var supplyLimitByDenom = async (denom) => {
  const bep3Params = BASE_URL + "/bep3/parameters";
  const bep3ParamsResponse = await fetch(bep3Params);
  const bep3ParamsData = await bep3ParamsResponse.json();
  const assetParams = bep3ParamsData.result.asset_params;

  const denomParams = assetParams.find(
    (item) => item.denom.toUpperCase() === denom.toUpperCase()
  );

  let hasSupplyLimit = denomParams && denomParams.supply_limit && denomParams.supply_limit.limit;
  return hasSupplyLimit ? (Number(denomParams.supply_limit.limit)/FACTOR_EIGHT) : 0
};

var getRewardApyForDenom = async (denom, lockedDenomBalance, kavaPrice) => {
  const incentiveParamsUrl = BASE_URL + "/incentive/parameters";
  const incentiveParamsResponse = await fetch(incentiveParamsUrl);
  const incentiveData = await incentiveParamsResponse.json();
  const incentiveResult = incentiveData.result;
  let ukavaRewardsPerPeriod = 0;
  let nanoSecondsPerPeriod = 0;
  if(incentiveResult) {
    if(incentiveResult.rewards && incentiveResult.rewards.length > 0) {
      const denomRewards = incentiveData.result.rewards.find(
        (item) => item.collateral_type.toUpperCase() === denom.toUpperCase()
      );
      ukavaRewardsPerPeriod = Number(denomRewards.available_rewards.amount);
      nanoSecondsPerPeriod = Number(denomRewards.duration);
    }
  }

  const kavaRewardsPerPeriod = ukavaRewardsPerPeriod/FACTOR_SIX;
  const periodsPerYear = rewardPeriodsPerYear(nanoSecondsPerPeriod);
  const rewardsPerYearInKava = kavaRewardsPerPeriod * periodsPerYear;
  const rewardsPerYearInUsd = rewardsPerYearInKava * Number(kavaPrice);

  const rawDenomApy = rewardsPerYearInUsd/lockedDenomBalance;
  const denomPercentageApy = Number(rawDenomApy) * 100;
  const denomPercentDisplay = usdFormatter.format(denomPercentageApy);
  const denomPercentDisplaySliced = denomPercentDisplay.slice(1, denomPercentDisplay.length);
  return denomPercentDisplaySliced + "%";
};

function rewardPeriodsPerYear(ns) {
  const NanoSecondsPerYear = Number(31449600000000000);
  return NanoSecondsPerYear / Number(ns)
}

var getValueRewardsDistributedForDenom = async (denom, kavaPrice) => {
  const rewardPeriodsURL = BASE_URL + "/incentive/rewardperiods";
  const rewardPeriodsRepsonse = await fetch(rewardPeriodsURL);
  const rewardPeriodsData = await rewardPeriodsRepsonse.json();

  let kavaDistributed = 0;

  if(rewardPeriodsData.result) {
    const denomRewardPeriod = rewardPeriodsData.result.find(
      (item) => item.collateral_type.toUpperCase() === denom.toUpperCase()
    );

    const rewardsStartTime = new Date(denomRewardPeriod.start);
    const millisecondsRewardActive = Date.now() - rewardsStartTime.getTime();
    const secondsRewardActive = millisecondsRewardActive / 1000;

    const ukavaRewardsPerSecond = denomRewardPeriod.reward.amount;
    const ukavaDistributed = Number(ukavaRewardsPerSecond) * Number(secondsRewardActive);
    kavaDistributed = ukavaDistributed / FACTOR_SIX;
  }
  return Number(kavaDistributed) * Number(kavaPrice);
};

var updateKavaPriceData = (kavaPrice, kavaPercentChange) => {
  const kavaPriceDisplay = usdFormatter.format(kavaPrice);
  document.getElementById("PRICE-KAVA").innerHTML = kavaPriceDisplay;

  const kavaPercentChangeDisplay = usdFormatter.format(kavaPercentChange);
  let kavaPercentChangeFinal;
  if(Number(kavaPercentChange) >= 0) {
     const kavaPercentChangeDisplaySliced = kavaPercentChangeDisplay.slice(1, kavaPercentChangeDisplay.length);
     kavaPercentChangeFinal =  "+" + kavaPercentChangeDisplaySliced + "%";
    document.getElementById("PERCENT-CHANGE-KAVA").style.background = "green";
  } else {
      const kavaPercentChangeDisplaySliced = kavaPercentChangeDisplay.slice(2, kavaPercentChangeDisplay.length);
      kavaPercentChangeFinal = "-" + kavaPercentChangeDisplaySliced + "%";
    document.getElementById("PERCENT-CHANGE-KAVA").style.background = "red";
  }

  document.getElementById("PERCENT-CHANGE-KAVA").innerHTML = kavaPercentChangeFinal;
}

var setDenomInfo = async (priceDenom, platformDenom, denomLockedId, usdxAmount, denomBorrowedId, kavaPrice, denomLockedValue, incentiveDenom, denomApyId) => {
  let denomPrice = await getCollateralPrice(`${priceDenom}:usd`);
  let denomTotalSupply = await totalAmountOnPlatformByDenom(platformDenom);
  let denomLimit = await supplyLimitByDenom(platformDenom)
  let denomTotalSupplyValue;

  if(denomTotalSupply) {
    const denomTotalSupplyCoin = denomTotalSupply/FACTOR_EIGHT;
    denomTotalSupplyValue = Number(denomTotalSupplyCoin * denomPrice);
    const denomLockedInMil = denomTotalSupplyValue/FACTOR_SIX;
    const denomLockedFormatted = usdFormatter.format(denomLockedInMil);
    const denomLockedDisplay = denomLockedFormatted + "M";
    document.getElementById(denomLockedId).innerHTML = denomLockedDisplay;
  }

  if(usdxAmount) {
    const usdxBorrowedInMil = usdxAmount/FACTOR_SIX;
    const usdxBorrowedFormatted = usdFormatter.format(usdxBorrowedInMil);
    const usdxBorrowedDisplay = usdxBorrowedFormatted + "M";
    document.getElementById(denomBorrowedId).innerHTML = usdxBorrowedDisplay;
  }

  if(denomLimit && denomTotalSupply) {
    const denomLimitDisplay = usdFormatter.format(denomLimit)
    const denomLimitSliced = denomLimitDisplay.slice(1, denomLimitDisplay.length-3);

    const totalDenom = denomTotalSupply/FACTOR_EIGHT;
    const totalDenomDisplay = usdFormatter.format(totalDenom)
    const totalDenomSliced = totalDenomDisplay.slice(1, totalDenomDisplay.length-3);

    const rawDenomUtilization = Number(totalDenom.toFixed(0)) / Number(denomLimit.toFixed(0))
    const percentDenomUtilization = Number(rawDenomUtilization.toFixed(3) * 100).toFixed(2) + "%";

    $(`.percent-line-${priceDenom}`).css("width", percentDenomUtilization);
    document.getElementById(`${priceDenom.toUpperCase()}_PERCENT`).innerHTML = percentDenomUtilization;
    document.getElementById(`${priceDenom.toUpperCase()}_LOCK_OVER_LIMIT`).innerHTML = totalDenomSliced + " / " + denomLimitSliced;
  }

  if(kavaPrice && denomLockedValue && incentiveDenom) {
    const denomValueLocked = Number(denomPrice) * Number(denomLockedValue)
    const denomRewardAPY = await getRewardApyForDenom(incentiveDenom, denomValueLocked, kavaPrice)
    document.getElementById(denomApyId).innerHTML = denomRewardAPY;
  }

  return { denomTotalSupplyValue };
};

var setUsdxAmountsByDenom = (denom, usdxAmount, usdxLimit) => {
  const usdxAmountDisplay = usdFormatter.format(usdxAmount)
  const usdxAmountDisplaySliced = usdxAmountDisplay.slice(1, usdxAmountDisplay.length-3);

  const usdxLimitDisplay = usdFormatter.format(usdxLimit)
  const usdxLimitDisplaySliced = usdxLimitDisplay.slice(1, usdxLimitDisplay.length-3);

  const rawUsdxUtilization = Number(usdxAmount.toFixed(0)) / Number(usdxLimit.toFixed(0))
  const percentUsdxUtilization = Number(rawUsdxUtilization.toFixed(3) * 100).toFixed(2) + "%";

  $(`.percent-line-usdx-${denom}`).css("width", percentUsdxUtilization);
  document.getElementById(`USDX_${denom.toUpperCase()}_PERCENT`).innerHTML = percentUsdxUtilization;
  document.getElementById(`USDX_${denom.toUpperCase()}_LOCK_OVER_LIMIT`).innerHTML = usdxAmountDisplaySliced + " / " + usdxLimitDisplaySliced;
};

var setUsdxAmount = (usdxLimit, kavaPlatformAmounts, usdxBorrowed, feesOwed) => {
  if(usdxLimit && kavaPlatformAmounts) {
    const usdxBorrowedAndFees = usdxBorrowed + feesOwed;
    return usdxBorrowedAndFees > usdxLimit ? Number(usdxLimit) : Number(usdxBorrowedAndFees);
  }
}

var updateDisplayValues = async () => {

  const kavaPriceData = await getKavaPrice();

  let kavaPrice;
  let kavaPercentChange;
  if(kavaPriceData) {
    kavaPrice = kavaPriceData.price;
    kavaPercentChange = kavaPriceData.percentChange;
    updateKavaPriceData(kavaPrice, kavaPercentChange);
  }

  let bnbPlatformAmounts = await totalLockedAndBorrowedByDenom('bnb-a');
  let bnbLocked;
  let bnbBorrowed;
  let bnbFees;
  if (bnbPlatformAmounts) {
    bnbLocked = bnbPlatformAmounts.locked;
    bnbBorrowed = bnbPlatformAmounts.borrowed;
    bnbFees = bnbPlatformAmounts.fees;
  }
  let bnbUsdxLimit = await usdxDebtLimitByDenom('BNB-A')

  let bnbUsdxAmount = setUsdxAmount(bnbUsdxLimit, bnbPlatformAmounts, bnbBorrowed, bnbFees)
  let bnbInfo = await setDenomInfo('bnb', 'bnb', 'TL-BNB', bnbUsdxAmount, 'TB-BNB', kavaPrice, bnbLocked, 'bnb-a', 'bnbAPY');
  let bnbTotalSupplyValue = bnbInfo.denomTotalSupplyValue;

  let btcPlatformAmounts = await totalLockedAndBorrowedByDenom('btcb-a');
  let btcLocked;
  let btcBorrowed;
  let btcFees;
  if (btcPlatformAmounts) {
    btcLocked = btcPlatformAmounts.locked;
    btcBorrowed = btcPlatformAmounts.borrowed;
    btcFees = btcPlatformAmounts.fees;
  }
  let btcUsdxLimit = await usdxDebtLimitByDenom('BTCB-A')
  let btcUsdxAmount = setUsdxAmount(btcUsdxLimit, btcPlatformAmounts, btcBorrowed, btcFees)
  let btcInfo = await setDenomInfo('btc', 'btcb', 'TL-BTC', btcUsdxAmount, 'TB-BTC', kavaPrice, btcLocked, null, 'btcAPY');
  let btcTotalSupplyValue = btcInfo.denomTotalSupplyValue;
  let busdPlatformAmounts = await totalLockedAndBorrowedByDenom('busd-a');
  let busdLocked;
  let busdBorrowed;
  let busdFees;
  if (busdPlatformAmounts) {
    busdLocked = busdPlatformAmounts.locked;
    busdBorrowed = busdPlatformAmounts.borrowed;
    busdFees = busdPlatformAmounts.fees;
  }
  let busdUsdxLimit = await usdxDebtLimitByDenom('BUSD-A')
  let busdUsdxAmount = setUsdxAmount(busdUsdxLimit, busdPlatformAmounts, busdBorrowed, busdFees)
  let busdInfo = await setDenomInfo('busd', 'busd', 'TL-BUSD', busdUsdxAmount, 'TB-BUSD', kavaPrice, busdLocked, 'busd-a', 'busdAPY');
  let busdTotalSupplyValue = busdInfo.denomTotalSupplyValue;

  let xrpPlatformAmounts = await totalLockedAndBorrowedByDenom('xrpb-a');

  let xrpLocked;
  let xrpBorrowed;
  let xrpFees;
  if (xrpPlatformAmounts) {
    xrpLocked = xrpPlatformAmounts.locked;
    xrpBorrowed = xrpPlatformAmounts.borrowed;
    xrpFees = xrpPlatformAmounts.fees;
  }
  let xrpUsdxLimit = await usdxDebtLimitByDenom('XRPB-A')
  let xrpUsdxAmount = setUsdxAmount(xrpUsdxLimit, xrpPlatformAmounts, xrpBorrowed, xrpFees)
  let xrpInfo = await setDenomInfo('xrp', 'xrpb', 'TL-XRP', xrpUsdxAmount, 'TB-XRP', kavaPrice, xrpLocked, null, 'xrpAPY');
  let xrpTotalSupplyValue = xrpInfo.denomTotalSupplyValue;

  let tvl = bnbTotalSupplyValue + btcTotalSupplyValue + busdTotalSupplyValue + xrpTotalSupplyValue;
  const totalSupplyValueDisplay = usdFormatter.format(tvl);
  const totalSupplyValueDisplaySliced = totalSupplyValueDisplay.slice(1, totalSupplyValueDisplay.length);
  document.getElementById("TVL").innerHTML = totalSupplyValueDisplaySliced + " USD";

  let totalUsdxAmount = bnbUsdxAmount + btcUsdxAmount + busdUsdxAmount + xrpUsdxAmount;
  const totalBorrowedDisplay = usdFormatter.format(totalUsdxAmount);
  const totalBorrowedDisplaySliced = totalBorrowedDisplay.slice(1, totalBorrowedDisplay.length);
  document.getElementById("TVB").innerHTML = totalBorrowedDisplaySliced + " USDX";

  let totalUsdxBorrowed = bnbBorrowed + btcBorrowed + busdBorrowed + xrpBorrowed;
  let totalUsdxLimit = bnbUsdxLimit + btcUsdxLimit + busdUsdxLimit + xrpUsdxLimit;

  const usdxAmountDisplay = usdFormatter.format(totalUsdxAmount)
  const usdxAmountDisplaySliced = usdxAmountDisplay.slice(1, usdxAmountDisplay.length-3);

  setUsdxAmountsByDenom('bnb', bnbUsdxAmount, bnbUsdxLimit)
  setUsdxAmountsByDenom('btc', btcUsdxAmount, btcUsdxLimit)
  setUsdxAmountsByDenom('busd', busdUsdxAmount, busdUsdxLimit)
  setUsdxAmountsByDenom('xrp', xrpUsdxAmount, xrpUsdxLimit)
  document.getElementById("USDXMINTED").innerHTML = usdxAmountDisplaySliced + " USDX";

  const bnbValueDistributed = await getValueRewardsDistributedForDenom('bnb-a', kavaPrice);
  const busdValueDistributed = await getValueRewardsDistributedForDenom('busd-a', kavaPrice);
  const totalValueDistributed = bnbValueDistributed + busdValueDistributed;
  const valueDistributedDisplay = usdFormatter.format(totalValueDistributed);
  const valueDistributedDisplaySliced = valueDistributedDisplay.slice(1, valueDistributedDisplay.length);
  document.getElementById("REWARDS_DISTRIBUTED").innerHTML = valueDistributedDisplaySliced + " USD";
};

  var main = async () => {
    await updateDisplayValues();
    await sleep(60000);
    main()
  }

  var sleep = (ms = 10000) => { return new Promise(resolve => setTimeout(resolve, ms)); }

 main();
