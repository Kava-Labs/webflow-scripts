const FACTOR_SIX = Number(10 ** 6);
const FACTOR_EIGHT = Number(10 ** 8);
const BASE_URL = "https://kava4.data.kava.io";

var usdFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

var isKavaNativeAsset = (denom) => {
  return ['ukava-a', 'usdx', 'hard'].includes(denom)
}

var totalLockedAndBorrowedByDenom = (cdpRes, denom) => {
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

var getCollateralPrice = async (market) => {
  const priceURL = BASE_URL + "/pricefeed/price/" + market;
  const priceResponse = await fetch(priceURL);
  const priceData = await priceResponse.json();
  const priceRes = priceData && priceData.result;
  const price = Number(priceRes.price);
  return price;
}

var totalAmountOnPlatformByDenom = (data, denom) => {
  const denomData = data.result.find((d) => d.current_supply.denom === denom)
  let amount = 0.00;
  if(denomData) { amount = Number(denomData.current_supply.amount) }
  return amount
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

var setBep3DenomInfo = async (suppliedAmounts, bep3SupplyData, incentiveParamsData, priceDenom, platformDenom, denomLockedId, usdxAmount, denomBorrowedId, kavaPrice, denomLockedValue, incentiveDenom, denomApyId) => {
  let denomPrice = await getCollateralPrice(`${priceDenom}:usd`);
  let denomTotalSupply = totalAmountOnPlatformByDenom(bep3SupplyData, platformDenom);
  let denomTotalSupplyValue =  Number((denomTotalSupply/FACTOR_EIGHT) * denomPrice)

  // set total locked
  let denomSupplyFromAcct = suppliedAmounts.find((a) => a.denom === platformDenom).amount
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
  const [
    kavaP,
    rewardPD,
    supplyA,
    bep3SD,
    bep3PD,
    cdpPD,
    incentivePD,
    btcbPA,
    busdPA,
    xrpPA,
    bnbPA,
    kavaPA,
    hardPA
  ] = await Promise.all([
    fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=KAVAUSDT'),
    fetch(BASE_URL + "/incentive/rewardperiods"),
    fetch(BASE_URL + '/auth/accounts/kava1wq9ts6l7atfn45ryxrtg4a2gwegsh3xha9e6rp'),
    fetch(BASE_URL + "/bep3/supplies"),
    fetch(BASE_URL + "/bep3/parameters"),
    fetch(BASE_URL + "/cdp/parameters"),
    fetch(BASE_URL + "/incentive/parameters"),
    fetch(BASE_URL + '/cdp/cdps/collateralType/btcb-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/busd-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/xrpb-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/bnb-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/ukava-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/hard-a')
  ]);

  const kavaPriceJson = await kavaP.json();
  const rewardPeriodsData = await rewardPD.json();
  const supAmtResp = await supplyA.json();
  const bep3SupplyData = await bep3SD.json();
  const bep3ParamsData = await bep3PD.json();
  const cdpParamsData = await cdpPD.json();
  const incentiveParamsData = await incentivePD.json();
  const btcPlatformAmountsJson = await btcbPA.json();
  const busdPlatformAmountsJson = await busdPA.json();
  const xrpPlatformAmountsJson = await xrpPA.json();
  const bnbPlatformAmountsJson = await bnbPA.json();
  const ukavaPlatformAmountsJson = await kavaPA.json();
  const hardPlatformAmountsJson = await hardPA.json();

  // "Total Rewards Distributed"
  const kavaPrice = await kavaPriceJson.lastPrice;
  const bnbValueDistributed = getValueRewardsDistributedForDenom(rewardPeriodsData, 'bnb-a', kavaPrice, new Date("2020-07-29T14:00:14.333506701Z"));
  const busdValueDistributed = getValueRewardsDistributedForDenom(rewardPeriodsData, 'busd-a', kavaPrice, new Date("2020-11-09T14:00:14.333506701Z"));
  const btcbValueDistributed = getValueRewardsDistributedForDenom(rewardPeriodsData, 'btcb-a', kavaPrice, new Date("2020-11-16T14:00:14.333506701Z"));
  const xrpbValueDistributed = getValueRewardsDistributedForDenom(rewardPeriodsData, 'xrpb-a', kavaPrice, new Date("2020-12-02T14:00:14.333506701Z"));
  const kavaValueDistributed = getValueRewardsDistributedForDenom(rewardPeriodsData, 'ukava-a', kavaPrice, new Date("2020-12-14T14:00:14.333506701Z"));
  // const hardValueDistributed = getValueRewardsDistributedForDenom(rewardPeriodsData, 'hard-a', kavaPrice, new Date("2020-12-14T14:00:14.333506701Z"));
  const totalValueDistributed = bnbValueDistributed + busdValueDistributed + btcbValueDistributed + xrpbValueDistributed + kavaValueDistributed; // + hardValueDistributed;
  const valueDistributedDisplay = usdFormatter.format(totalValueDistributed);
  const valueDistributedDisplaySliced = valueDistributedDisplay.slice(1, valueDistributedDisplay.length);
  document.getElementById("TOTAL-REWARDS-DISTRIBUTED").innerHTML = valueDistributedDisplaySliced;


  const suppliedAmounts = await supAmtResp.result.value.coins;
  const btcPlatformAmounts = await totalLockedAndBorrowedByDenom(btcPlatformAmountsJson.result, 'btcb-a')
  const busdPlatformAmounts = await totalLockedAndBorrowedByDenom(busdPlatformAmountsJson.result, 'busd-a')
  const xrpPlatformAmounts = await totalLockedAndBorrowedByDenom(xrpPlatformAmountsJson.result, 'xrpb-a')
  const bnbPlatformAmounts = await totalLockedAndBorrowedByDenom(bnbPlatformAmountsJson.result, 'bnb-a')
  const ukavaPlatformAmounts = await totalLockedAndBorrowedByDenom(ukavaPlatformAmountsJson.result, 'ukava-a')
  const hardPlatformAmounts = await totalLockedAndBorrowedByDenom(hardPlatformAmountsJson.result, 'hard-a')

  // btcb
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
  let btcInfo = await setBep3DenomInfo(suppliedAmounts, bep3SupplyData, incentiveParamsData, 'btc', 'btcb', 'TL-BTC', btcUsdxAmount, 'TB-BTC', kavaPrice, btcLocked, 'btcb-a', 'APY-BTC');
  let btcTotalSupplyValue = btcInfo.denomTotalSupplyValue;

  // busd
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
  let busdInfo = await setBep3DenomInfo(suppliedAmounts, bep3SupplyData, incentiveParamsData, 'busd', 'busd', 'TL-BUSD', busdUsdxAmount, 'TB-BUSD', kavaPrice, busdLocked, 'busd-a', 'APY-BUSD');
  let busdTotalSupplyValue = busdInfo.denomTotalSupplyValue;

  // xrpb

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
  let xrpInfo = await setBep3DenomInfo(suppliedAmounts, bep3SupplyData, incentiveParamsData, 'xrp', 'xrpb', 'TL-XRP', xrpUsdxAmount, 'TB-XRP', kavaPrice, xrpLocked, 'xrpb-a', 'APY-XRP');
  let xrpTotalSupplyValue = xrpInfo.denomTotalSupplyValue;

  // bnb
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
  let bnbInfo = await setBep3DenomInfo(suppliedAmounts, bep3SupplyData, incentiveParamsData, 'bnb', 'bnb', 'TL-BNB', bnbUsdxAmount, 'TB-BNB', kavaPrice, bnbLocked, 'bnb-a', 'APY-BNB');
  let bnbTotalSupplyValue = bnbInfo.denomTotalSupplyValue;

   // kava
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
  let hardLocked;
  let hardBorrowed;
  let hardFees;
  if (hardPlatformAmounts) {
    hardLocked = hardPlatformAmounts.locked;
    hardBorrowed = hardPlatformAmounts.borrowed;
    hardFees = hardPlatformAmounts.fees;
  }
  let hardUsdxLimit = await usdxDebtLimitByDenom('HARD-A', cdpParamsData)

  let hardUsdxAmount = setUsdxAmount(hardUsdxLimit, hardPlatformAmounts, hardBorrowed, hardFees)
  await setKavaChainDenomInfo(suppliedAmounts, incentiveParamsData, 'hard', 'hard', 'TL-HARD', hardUsdxAmount, 'TB-HARD', kavaPrice, hardLocked, null, 'APY-HARD');


  let totalValueSupplied = bnbTotalSupplyValue + btcTotalSupplyValue + busdTotalSupplyValue + xrpTotalSupplyValue;
  let totalValueBorrowed = bnbUsdxAmount + btcUsdxAmount + busdUsdxAmount + xrpUsdxAmount + ukavaUsdxAmount + hardUsdxAmount;
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
