const FACTOR_SIX = Number(10 ** 6);
const FACTOR_EIGHT = Number(10 ** 8);
const BASE_URL = "https://api.kava.io";

var usdFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

var isKavaNativeAsset = (denom) => {
  return ['ukava-a', 'usdx', 'hard', 'ukava', 'hard-a'].includes(denom)
}

var totalLockedAndBorrowedByDenom = (cdpRes, denom) => {
  let locked = 0;
  let borrowed = 0;
  let fees = 0;
  if (cdpRes) {
    var { collateral, principal, accumulated_fees } = cdpRes.reduce(function(accumulator, item) {
      Object.keys(item.cdp).forEach(function(key) {
        let c = ['collateral', 'principal', 'accumulated_fees'];
        if(c.includes(key)){
          accumulator[key] = Number((accumulator[key] || 0)) + Number(item.cdp[key].amount);
        }
      });
      return accumulator;
    }, {});

    locked = isKavaNativeAsset(denom) ? Number(collateral/FACTOR_SIX) : Number(collateral/FACTOR_EIGHT),
    borrowed = Number(principal/FACTOR_SIX),
    fees = Number(accumulated_fees/FACTOR_SIX)
  }

  return { locked, borrowed, fees }
};

var totalAmountOnPlatformByDenom = (data, denom) => {
  const denomData = data.result.find((d) => d.current_supply.denom === denom)
  let amount = 0.00;
  if(denomData) { amount = Number(denomData.current_supply.amount) }
  return amount
}

var getRewardApyForDenom = (denom, lockedDenomBalance, kavaPrice, incentiveParamsData) => {
  const data = incentiveParamsData.result;
  let ukavaRewardsPerSecond = 0;
  if(data) {
    if(data.usdx_minting_reward_periods && data.usdx_minting_reward_periods.length > 0) {
      const denomRewards = data.usdx_minting_reward_periods.find(
        (item) => item.collateral_type.toUpperCase() === denom.toUpperCase()
      );
      ukavaRewardsPerSecond = Number(denomRewards.rewards_per_second.amount);
    }
  }

  const kavaRewardsPerYear = (ukavaRewardsPerSecond * 31536000 / 10 ** 6)
  const rewardsPerYearInUsd = kavaRewardsPerYear * Number(kavaPrice);

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

var setKavaChainDenomInfo = async (suppliedAmounts, incentiveParamsData, supplyDenom, denomPrice, denomLockedId, usdxAmount, denomBorrowedId, kavaPrice, denomLockedValue, incentiveDenom, denomApyId) => {
  if(supplyDenom === 'ukava') { denomPrice = kavaPrice }

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

var setBep3DenomInfo = async (suppliedAmounts, bep3SupplyData, incentiveParamsData, denomPrice, platformDenom, denomLockedId, usdxAmount, denomBorrowedId, kavaPrice, denomLockedValue, incentiveDenom, denomApyId) => {
  let denomTotalSupply = totalAmountOnPlatformByDenom(bep3SupplyData, platformDenom);
  let denomTotalSupplyValue =  Number((denomTotalSupply/FACTOR_EIGHT) * denomPrice)

  // set total locked
  let supplyAmount = 0;
  let denomSupplyFromAcct = suppliedAmounts.find((a) => a.denom === platformDenom)
  if(denomSupplyFromAcct) {
    supplyAmount = denomSupplyFromAcct.amount;
    setDenomTotalLocked(supplyAmount, FACTOR_EIGHT, denomPrice, denomLockedId)
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
    const denomRewardPeriod = rewardPeriodsData.result.usdx_minting_reward_periods.find(
      (item) => item.collateral_type.toUpperCase() === denom.toUpperCase()
    );

    const millisecondsRewardActive = Date.now() - rewardsStartTime.getTime();
    const secondsRewardActive = millisecondsRewardActive / 1000;

    let ukavaRewardsPerSecond = 0;
    if(denomRewardPeriod) {
      ukavaRewardsPerSecond = denomRewardPeriod.rewards_per_second.amount;
    }
    const ukavaDistributed = Number(ukavaRewardsPerSecond) * Number(secondsRewardActive);
    kavaDistributed = ukavaDistributed / FACTOR_SIX;
  }
  return Number(kavaDistributed) * Number(kavaPrice);
};

var getCollateralPrice = (priceData) => {
  const priceRes = priceData && priceData.result;
  const price = Number(priceRes.price);
  return price;
}

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
    hardPA,
    btcPR,
    busdPR,
    xrpPR,
    bnbPR,
    kavaPR,
    hardPR
  ] = await Promise.all([
    fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=KAVAUSDT'),
    fetch(BASE_URL + "/incentive/parameters"),
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
    fetch(BASE_URL + '/cdp/cdps/collateralType/hard-a'),
    fetch(BASE_URL + '/pricefeed/price/btc:usd'),
    fetch(BASE_URL + '/pricefeed/price/busd:usd'),
    fetch(BASE_URL + '/pricefeed/price/xrp:usd'),
    fetch(BASE_URL + '/pricefeed/price/bnb:usd'),
    fetch(BASE_URL + '/pricefeed/price/kava:usd'),
    fetch(BASE_URL + '/pricefeed/price/hard:usd')
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
  const btcPFJson = await btcPR.json();
  const busdPFJson = await busdPR.json();
  const xrpPFJson = await xrpPR.json();
  const bnbPFJson = await bnbPR.json();
  const kavaPFJson = await kavaPR.json();
  const hardPFJson = await hardPR.json();

  // "Total Rewards Distributed"
  const kavaPrice = await kavaPriceJson.lastPrice;
  const bnbValueDistributed = getValueRewardsDistributedForDenom(rewardPeriodsData, 'bnb-a', kavaPrice, new Date("2020-07-29T14:00:14.333506701Z"));
  const busdValueDistributed = getValueRewardsDistributedForDenom(rewardPeriodsData, 'busd-a', kavaPrice, new Date("2020-11-09T14:00:14.333506701Z"));
  const btcbValueDistributed = getValueRewardsDistributedForDenom(rewardPeriodsData, 'btcb-a', kavaPrice, new Date("2020-11-16T14:00:14.333506701Z"));
  const xrpbValueDistributed = getValueRewardsDistributedForDenom(rewardPeriodsData, 'xrpb-a', kavaPrice, new Date("2020-12-02T14:00:14.333506701Z"));
  const kavaValueDistributed = getValueRewardsDistributedForDenom(rewardPeriodsData, 'ukava-a', kavaPrice, new Date("2020-12-14T14:00:14.333506701Z"));
  const hardValueDistributed = getValueRewardsDistributedForDenom(rewardPeriodsData, 'hard-a', kavaPrice, new Date("2021-01-15T14:00:14.333506701Z"));
  const totalValueDistributed = bnbValueDistributed + busdValueDistributed + btcbValueDistributed + xrpbValueDistributed + kavaValueDistributed + hardValueDistributed;
  const valueDistributedDisplay = usdFormatter.format(totalValueDistributed);
  const valueDistributedDisplaySliced = valueDistributedDisplay.slice(1, valueDistributedDisplay.length);
  const trd = document.getElementById("TOTAL-REWARDS-DISTRIBUTED")
  trd.innerHTML = valueDistributedDisplaySliced


  const suppliedAmounts = await supAmtResp.result.value.coins;
  const btcPlatformAmounts = totalLockedAndBorrowedByDenom(btcPlatformAmountsJson.result, 'btcb-a')
  const busdPlatformAmounts = totalLockedAndBorrowedByDenom(busdPlatformAmountsJson.result, 'busd-a')
  const xrpPlatformAmounts = totalLockedAndBorrowedByDenom(xrpPlatformAmountsJson.result, 'xrpb-a')
  const bnbPlatformAmounts = totalLockedAndBorrowedByDenom(bnbPlatformAmountsJson.result, 'bnb-a')
  const ukavaPlatformAmounts = totalLockedAndBorrowedByDenom(ukavaPlatformAmountsJson.result, 'ukava-a')
  const hardPlatformAmounts = totalLockedAndBorrowedByDenom(hardPlatformAmountsJson.result, 'hard-a')

  const btcPF = getCollateralPrice(btcPFJson)
  const busdPF = getCollateralPrice(busdPFJson)
  const xrpbPF = getCollateralPrice(xrpPFJson)
  const bnbPF = getCollateralPrice(bnbPFJson)
  const kavaPF = getCollateralPrice(kavaPFJson)
  const hardPF = getCollateralPrice(hardPFJson)

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
  let btcInfo = await setBep3DenomInfo(suppliedAmounts, bep3SupplyData, incentiveParamsData, btcPF, 'btcb', 'TL-BTC', btcUsdxAmount, 'TB-BTC', kavaPrice, btcLocked, 'btcb-a', 'APY-BTC');
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
  let busdInfo = await setBep3DenomInfo(suppliedAmounts, bep3SupplyData, incentiveParamsData, busdPF, 'busd', 'TL-BUSD', busdUsdxAmount, 'TB-BUSD', kavaPrice, busdLocked, 'busd-a', 'APY-BUSD');
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
  let xrpInfo = await setBep3DenomInfo(suppliedAmounts, bep3SupplyData, incentiveParamsData, xrpbPF, 'xrpb', 'TL-XRP', xrpUsdxAmount, 'TB-XRP', kavaPrice, xrpLocked, 'xrpb-a', 'APY-XRP');
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
  let bnbInfo = await setBep3DenomInfo(suppliedAmounts, bep3SupplyData, incentiveParamsData, bnbPF, 'bnb', 'TL-BNB', bnbUsdxAmount, 'TB-BNB', kavaPrice, bnbLocked, 'bnb-a', 'APY-BNB');
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
  await setKavaChainDenomInfo(suppliedAmounts, incentiveParamsData, 'ukava', kavaPF, 'TL-KAVA', ukavaUsdxAmount, 'TB-KAVA', kavaPrice, ukavaLocked, 'ukava-a', 'APY-KAVA');

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
  await setKavaChainDenomInfo(suppliedAmounts, incentiveParamsData, 'hard', hardPF, 'TL-HARD', hardUsdxAmount, 'TB-HARD', kavaPrice, hardLocked, 'hard-a', 'APY-HARD');


  let totalValueSupplied = bnbTotalSupplyValue + btcTotalSupplyValue + busdTotalSupplyValue + xrpTotalSupplyValue;
  let totalValueBorrowed = bnbUsdxAmount + btcUsdxAmount + busdUsdxAmount + xrpUsdxAmount + ukavaUsdxAmount + hardUsdxAmount;
  let totalAssetValue = totalValueSupplied + totalValueBorrowed;
  const totalSupplyValueDisplay = usdFormatter.format(totalAssetValue);
  const totalSupplyValueDisplaySliced = totalSupplyValueDisplay.slice(1, totalSupplyValueDisplay.length);
  const tvl = document.getElementById("TOTAL-VALUE-LOCKED")
  tvl.innerHTML = totalSupplyValueDisplaySliced

  $(".metric-blur").css("background-color", "transparent")
  $(".metric-blur").addClass('without-after');
  $(".api-metric").css({"display": "block", "text-align": "center"})
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
