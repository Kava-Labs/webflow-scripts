const FACTOR_SIX = Number(10 ** 6);
const FACTOR_EIGHT = Number(10 ** 8);
const BASE_URL = "https://kava4.data.kava.io";

var usdFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

var getKavaPrice = async () => {
  const priceURL = "https://api.binance.com/api/v3/ticker/24hr?symbol=KAVAUSDT";
  const priceResponse = await fetch(priceURL);
  const priceData = await priceResponse.json();
  return priceData.lastPrice;
};

var isKavaNativeAsset = (denom) => {
  return ['ukava-a', 'usdx', 'hard'].includes(denom)
}

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
    locked: isKavaNativeAsset(denom) ? Number(collateral/FACTOR_SIX) : Number(collateral/FACTOR_EIGHT),
    borrowed: Number(principal/FACTOR_SIX),
    fees: Number(accumulated_fees/FACTOR_SIX)
  }
};

var getTotalSupplied = async () => {
  let acctUrl = BASE_URL + '/auth/accounts/kava1wq9ts6l7atfn45ryxrtg4a2gwegsh3xha9e6rp';
  const acctResponse = await fetch(acctUrl);
  const acctData = await acctResponse.json();
  return acctData.result.value.coins;
}

var getCollateralPrice = async (market) => {
  const priceURL = BASE_URL + "/pricefeed/price/" + market;
  const priceResponse = await fetch(priceURL);
  const priceData = await priceResponse.json();
  const priceRes = priceData && priceData.result;
  const price = Number(priceRes.price);
  return price;
}

var getCdpParameters = async () => {
  const usdxLimitURL = BASE_URL + "/cdp/parameters";
  const paramsResponse = await fetch(usdxLimitURL);
  const paramsData = await paramsResponse.json();
  return paramsData;
}

var totalAmountOnPlatformByDenom = async (denom) => {
  const supplyURL = BASE_URL + "/bep3/supply/" + denom;
  const supplyResponse = await fetch(supplyURL);
  const supplyData = await supplyResponse.json();
  const supplyRes = supplyData && supplyData.result;
  return Number(supplyRes.current_supply.amount);
};

var getBep3ParamsData = async () => {
  const bep3Params = BASE_URL + "/bep3/parameters";
  const bep3ParamsResponse = await fetch(bep3Params);
  const bep3ParamsData = await bep3ParamsResponse.json();
  return bep3ParamsData
}

var getIncentiveParams = async () => {
  const incentiveParamsUrl = BASE_URL + "/incentive/parameters";
  const incentiveParamsResponse = await fetch(incentiveParamsUrl);
  const incentiveData = await incentiveParamsResponse.json();
  return incentiveData;
}

var getRewardApyForDenom = (denom, lockedDenomBalance, kavaPrice, incentiveParamsData) => {
  const incentiveResult = incentiveParamsData.result;
  let ukavaRewardsPerPeriod = 0;
  let nanoSecondsPerPeriod = 0;
  if(incentiveResult) {
    if(incentiveResult.rewards && incentiveResult.rewards.length > 0) {
      const denomRewards = incentiveParamsData.result.rewards.find(
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

var usdxDebtLimitByDenom = (denom, paramsData) => {
  const collateralParams = paramsData.result.collateral_params;

  const denomParams = collateralParams.find(
    (item) => item.type.toUpperCase() === denom.toUpperCase()
  );

  let hasDebtLimit = denomParams && denomParams.debt_limit;
  return hasDebtLimit ? (Number(denomParams.debt_limit.amount)/FACTOR_SIX) : 0
};

var setUsdxAmount = (usdxLimit, kavaPlatformAmounts, usdxBorrowed, feesOwed) => {
  if(usdxLimit && kavaPlatformAmounts) {
    const usdxBorrowedAndFees = usdxBorrowed + feesOwed;
    return usdxBorrowedAndFees > usdxLimit ? Number(usdxLimit) : Number(usdxBorrowedAndFees);
  }
}

var setDenomTotalLocked = (denomSupplyFromAcct, factor, denomPrice, denomLockedId) => {
  const denomTotalSupplyCoin = denomSupplyFromAcct/factor;
  const denomTotalSupplyValue = Number(denomTotalSupplyCoin * denomPrice);
  const denomLockedInMil = denomTotalSupplyValue/FACTOR_SIX;
  const denomLockedFormatted = usdFormatter.format(denomLockedInMil);
  const denomLockedDisplay = denomLockedFormatted + "M";
  document.getElementById(denomLockedId).innerHTML = denomLockedDisplay;
}

var setDenomTotalBorrowed = (usdxAmount, denomBorrowedId) => {
  const usdxBorrowedInMil = usdxAmount/FACTOR_SIX;
  const usdxBorrowedFormatted = usdFormatter.format(usdxBorrowedInMil);
  const usdxBorrowedDisplay = usdxBorrowedFormatted + "M";
  document.getElementById(denomBorrowedId).innerHTML = usdxBorrowedDisplay;
}

var setDenomAPY = (denomPrice, denomLockedValue, incentiveDenom, kavaPrice, incentiveParamsData, denomApyId) => {
  const denomValueLocked = Number(denomPrice) * Number(denomLockedValue)
  const denomRewardAPY = getRewardApyForDenom(incentiveDenom, denomValueLocked, kavaPrice, incentiveParamsData)
  document.getElementById(denomApyId).innerHTML = denomRewardAPY;
}

var setKavaChainDenomInfo = async (suppliedAmounts, incentiveParamsData, supplyDenom, priceDenom, denomLockedId, usdxAmount, denomBorrowedId, kavaPrice, denomLockedValue, incentiveDenom, denomApyId) => {
  supplyDenom === 'ukava' ? denomPrice = kavaPrice : denomPrice = await getCollateralPrice(`${priceDenom}:usd`);

  let denomSupplyFromAcct = suppliedAmounts.find((a) => a.denom === supplyDenom).amount;

  // set total locked
  if(denomSupplyFromAcct) {
    setDenomTotalLocked(denomSupplyFromAcct, FACTOR_SIX, denomPrice, denomLockedId)
  }

  // set total borrowed
  if(usdxAmount) { setDenomTotalBorrowed(usdxAmount, denomBorrowedId); }

  // set the APY
  if(denomPrice && kavaPrice && denomLockedValue && incentiveDenom && incentiveParamsData && denomApyId && incentiveDenom) {
    setDenomAPY(denomPrice, denomLockedValue, incentiveDenom, kavaPrice, incentiveParamsData, denomApyId)
  }
}

var setBep3DenomInfo = async (suppliedAmounts, incentiveParamsData, priceDenom, platformDenom, denomLockedId, usdxAmount, denomBorrowedId, kavaPrice, denomLockedValue, incentiveDenom, denomApyId) => {
  let denomPrice = await getCollateralPrice(`${priceDenom}:usd`);
  let denomTotalSupply = await totalAmountOnPlatformByDenom(platformDenom);
  let denomSupplyFromAcct = suppliedAmounts.find((a) => a.denom === platformDenom).amount
  let denomTotalSupplyValue =  Number((denomTotalSupply/FACTOR_EIGHT) * denomPrice)

  // set total locked
  if(denomSupplyFromAcct) {
    setDenomTotalLocked(denomSupplyFromAcct, FACTOR_EIGHT, denomPrice, denomLockedId)
  }

  // set total borrowed
  if(usdxAmount) { setDenomTotalBorrowed(usdxAmount, denomBorrowedId); }

  // set the APY
  if(denomPrice && kavaPrice && denomLockedValue && incentiveDenom && incentiveParamsData && denomApyId) {
    setDenomAPY(denomPrice, denomLockedValue, incentiveDenom, kavaPrice, incentiveParamsData, denomApyId)
  }
  return { denomTotalSupplyValue };
};

var getRewardPeriodsData = async () => {
  const rewardPeriodsURL = BASE_URL + "/incentive/rewardperiods";
  const rewardPeriodsRepsonse = await fetch(rewardPeriodsURL);
  const rewardPeriodsData = await rewardPeriodsRepsonse.json();
  return rewardPeriodsData;
}

var getValueRewardsDistributedForDenom = (rewardPeriodsData, denom, kavaPrice, rewardsStartTime) => {
  if(!rewardsStartTime) { return 0.00 }
  let kavaDistributed = 0;

  if(rewardPeriodsData.result) {
    const denomRewardPeriod = rewardPeriodsData.result.find(
      (item) => item.collateral_type.toUpperCase() === denom.toUpperCase()
    );

    const millisecondsRewardActive = Date.now() - rewardsStartTime.getTime();
    const secondsRewardActive = millisecondsRewardActive / 1000;

    const ukavaRewardsPerSecond = denomRewardPeriod.reward.amount;
    const ukavaDistributed = Number(ukavaRewardsPerSecond) * Number(secondsRewardActive);
    kavaDistributed = ukavaDistributed / FACTOR_SIX;
  }
  return Number(kavaDistributed) * Number(kavaPrice);
};

var updateDisplayValues = async () => {
  const kavaPrice = await getKavaPrice();

  // "Total Rewards Distributed"
  const rewardPeriodsData = await getRewardPeriodsData();
  const bnbValueDistributed = getValueRewardsDistributedForDenom(rewardPeriodsData, 'bnb-a', kavaPrice, new Date("2020-07-29T14:00:14.333506701Z"));
  const busdValueDistributed = getValueRewardsDistributedForDenom(rewardPeriodsData, 'busd-a', kavaPrice, new Date("2020-11-09T14:00:14.333506701Z"));
  const btcbValueDistributed = getValueRewardsDistributedForDenom(rewardPeriodsData, 'btcb-a', kavaPrice, new Date("2020-11-16T14:00:14.333506701Z"));
  const xrpbValueDistributed = getValueRewardsDistributedForDenom(rewardPeriodsData, 'xrpb-a', kavaPrice, new Date("2020-12-02T14:00:14.333506701Z"));
  const kavaValueDistributed = getValueRewardsDistributedForDenom(rewardPeriodsData, 'ukava-a', kavaPrice, new Date("2020-12-14T14:00:14.333506701Z"));
  const totalValueDistributed = bnbValueDistributed + busdValueDistributed + btcbValueDistributed + xrpbValueDistributed; // + kavaValueDistributed;
  const valueDistributedDisplay = usdFormatter.format(totalValueDistributed);
  const valueDistributedDisplaySliced = valueDistributedDisplay.slice(1, valueDistributedDisplay.length);
  document.getElementById("TOTAL-REWARDS-DISTRIBUTED").innerHTML = valueDistributedDisplaySliced;

  // asset rows
  let suppliedAmounts = await getTotalSupplied();
  const bep3ParamsData = await getBep3ParamsData();
  const cdpParamsData = await getCdpParameters();
  const incentiveParamsData = await getIncentiveParams();

  // btcb
  let btcPlatformAmounts = await totalLockedAndBorrowedByDenom('btcb-a');
  let btcLocked;
  let btcBorrowed;
  let btcFees;
  if (btcPlatformAmounts) {
    btcLocked = btcPlatformAmounts.locked;
    btcBorrowed = btcPlatformAmounts.borrowed;
    btcFees = btcPlatformAmounts.fees;
  }
  let btcUsdxLimit = await usdxDebtLimitByDenom('BTCB-A', cdpParamsData)
  let btcUsdxAmount = setUsdxAmount(btcUsdxLimit, btcPlatformAmounts, btcBorrowed, btcFees)
  let btcInfo = await setBep3DenomInfo(suppliedAmounts, incentiveParamsData, 'btc', 'btcb', 'TL-BTC', btcUsdxAmount, 'TB-BTC', kavaPrice, btcLocked, 'btcb-a', 'APY-BTC');
  let btcTotalSupplyValue = btcInfo.denomTotalSupplyValue;

  // busd
  let busdPlatformAmounts = await totalLockedAndBorrowedByDenom('busd-a');
  let busdLocked;
  let busdBorrowed;
  let busdFees;
  if (busdPlatformAmounts) {
    busdLocked = busdPlatformAmounts.locked;
    busdBorrowed = busdPlatformAmounts.borrowed;
    busdFees = busdPlatformAmounts.fees;
  }
  let busdUsdxLimit = await usdxDebtLimitByDenom('BUSD-A', cdpParamsData)
  let busdUsdxAmount = setUsdxAmount(busdUsdxLimit, busdPlatformAmounts, busdBorrowed, busdFees)
  let busdInfo = await setBep3DenomInfo(suppliedAmounts, incentiveParamsData, 'busd', 'busd', 'TL-BUSD', busdUsdxAmount, 'TB-BUSD', kavaPrice, busdLocked, 'busd-a', 'APY-BUSD');
  let busdTotalSupplyValue = busdInfo.denomTotalSupplyValue;

  // xrpb
  let xrpPlatformAmounts = await totalLockedAndBorrowedByDenom('xrpb-a');
  let xrpLocked;
  let xrpBorrowed;
  let xrpFees;
  if (xrpPlatformAmounts) {
    xrpLocked = xrpPlatformAmounts.locked;
    xrpBorrowed = xrpPlatformAmounts.borrowed;
    xrpFees = xrpPlatformAmounts.fees;
  }
  let xrpUsdxLimit = await usdxDebtLimitByDenom('XRPB-A', cdpParamsData)
  let xrpUsdxAmount = setUsdxAmount(xrpUsdxLimit, xrpPlatformAmounts, xrpBorrowed, xrpFees)
  let xrpInfo = await setBep3DenomInfo(suppliedAmounts, incentiveParamsData, 'xrp', 'xrpb', 'TL-XRP', xrpUsdxAmount, 'TB-XRP', kavaPrice, xrpLocked, 'xrpb-a', 'APY-XRP');
  let xrpTotalSupplyValue = xrpInfo.denomTotalSupplyValue;

  // bnb
  let bnbPlatformAmounts = await totalLockedAndBorrowedByDenom('bnb-a');
  let bnbLocked;
  let bnbBorrowed;
  let bnbFees;
  if (bnbPlatformAmounts) {
    bnbLocked = bnbPlatformAmounts.locked;
    bnbBorrowed = bnbPlatformAmounts.borrowed;
    bnbFees = bnbPlatformAmounts.fees;
  }
  let bnbUsdxLimit = await usdxDebtLimitByDenom('BNB-A', cdpParamsData)
  let bnbUsdxAmount = setUsdxAmount(bnbUsdxLimit, bnbPlatformAmounts, bnbBorrowed, bnbFees)
  let bnbInfo = await setBep3DenomInfo(suppliedAmounts, incentiveParamsData, 'bnb', 'bnb', 'TL-BNB', bnbUsdxAmount, 'TB-BNB', kavaPrice, bnbLocked, 'bnb-a', 'APY-BNB');
  let bnbTotalSupplyValue = bnbInfo.denomTotalSupplyValue;

   // kava
  let ukavaPlatformAmounts = await totalLockedAndBorrowedByDenom('ukava-a');
  let ukavaLocked;
  let ukavaBorrowed;
  let ukavaFees;
  if (ukavaPlatformAmounts) {
    ukavaLocked = ukavaPlatformAmounts.locked;
    ukavaBorrowed = ukavaPlatformAmounts.borrowed;
    ukavaFees = ukavaPlatformAmounts.fees;
  }
  let ukavaUsdxLimit = await usdxDebtLimitByDenom('UKAVA-A', cdpParamsData)

  let ukavaUsdxAmount = setUsdxAmount(ukavaUsdxLimit, ukavaPlatformAmounts, ukavaBorrowed, ukavaFees)
  await setKavaChainDenomInfo(suppliedAmounts, incentiveParamsData, 'ukava', 'kava', 'TL-KAVA', ukavaUsdxAmount, 'TB-KAVA', kavaPrice, ukavaLocked, 'ukava-a', 'APY-KAVA');

  // hard
  // let hardPlatformAmounts = await totalLockedAndBorrowedByDenom('hard-a');
  // let hardLocked;
  // let hardBorrowed;
  // let hardFees;
  // if (hardPlatformAmounts) {
  //   hardLocked = hardPlatformAmounts.locked;
  //   hardBorrowed = hardPlatformAmounts.borrowed;
  //   hardFees = hardPlatformAmounts.fees;
  // }
  // let hardUsdxLimit = await usdxDebtLimitByDenom('HARD-A', cdpParamsData)

  // let hardUsdxAmount = setUsdxAmount(hardUsdxLimit, hardPlatformAmounts, hardBorrowed, hardFees)
  // await setKavaChainDenomInfo(suppliedAmounts, incentiveParamsData, 'hard', 'hard', 'TL-HARD', hardUsdxAmount, 'TB-HARD', kavaPrice, hardLocked, null, 'APY-HARD');


  let totalValueSupplied = bnbTotalSupplyValue + btcTotalSupplyValue + busdTotalSupplyValue + xrpTotalSupplyValue;
  let totalValueBorrowed = bnbUsdxAmount + btcUsdxAmount + busdUsdxAmount + xrpUsdxAmount + ukavaUsdxAmount; // + hardUsdxAmount;
  let totalAssetValue = totalValueSupplied + totalValueBorrowed;
  const totalSupplyValueDisplay = usdFormatter.format(totalAssetValue);
  const totalSupplyValueDisplaySliced = totalSupplyValueDisplay.slice(1, totalSupplyValueDisplay.length);
  document.getElementById("TOTAL-VALUE-LOCKED").innerHTML = totalSupplyValueDisplaySliced;
};

  var main = async () => {
    Promise.all(
      await updateDisplayValues(),
      await sleep(60000),
      main()
    )
  }

  var sleep = (ms = 10000) => { return new Promise(resolve => setTimeout(resolve, ms)); }

 main();
