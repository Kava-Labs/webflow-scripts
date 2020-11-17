const FACTOR_SIX = Number(10 ** 6);
const FACTOR_EIGHT = Number(10 ** 8);
const BASE_URL = "https://kava4.data.kava.io";

var getKavaPrice = async () => {
  const priceURL = "https://api.binance.com/api/v3/ticker/24hr?symbol=KAVAUSDT";
  const priceResponse = await fetch(priceURL);
  const priceData = await priceResponse.json();
  return {
    price: priceData.lastPrice,
    percentChange: priceData.priceChangePercent
  }
}

var setSecondsRewardActive = (rewardsStartTimes) => {
  return rewardsStartTimes.map((st) => {
    const millisecondsRewardActive = Date.now() - st.date.getTime();
    return { denom: st.denom, secondsRewardActive: (millisecondsRewardActive / 1000) }
  })
}

var getValueRewardsDistributed = async (kavaPrice) => {
  const rewardPeriodsURL = BASE_URL + "/incentive/rewardperiods";
  const rewardPeriodsResponse = await fetch(rewardPeriodsURL);
  const rewardPeriodsData = await rewardPeriodsResponse.json();

  const rewardStartTimes = [
    { denom: 'bnb-a', date: new Date("2020-07-29T14:00:14.333506701Z") },
    { denom: 'busd-a', date: new Date("2020-11-09T14:00:14.333506701Z") },
    { denom: 'btcb-a', date: new Date("2020-11-16T14:00:14.333506701Z") },
  ]

  const secondsRewardActives = setSecondsRewardActive(rewardStartTimes);

  let kavaDistributed = 0;
  if(rewardPeriodsData.result) {
    const totalByDenom = rewardPeriodsData.result.map((d) => {

      const denomActiveTime = secondsRewardActives.find(r => r.denom === d.collateral_type);
      let secondsRewardActive = denomActiveTime ? denomActiveTime.secondsRewardActive : 0;

      const ukavaRewardsPerSecond = d.reward.amount;
      return Number(ukavaRewardsPerSecond) * Number(secondsRewardActive)
    })

    const ukavaDistributed = totalByDenom.reduce(
      (acc, val) => acc + val, 0
    );

    console.log(ukavaDistributed)

    kavaDistributed = ukavaDistributed / FACTOR_SIX;
  }

  const totalRewardValue = Number(kavaDistributed) * Number(kavaPrice)
  return totalRewardValue;
}

setTimeout(async function(){
  const priceData = await getKavaPrice();
  const usdRewardsDistributed = await getValueRewardsDistributed(Number(priceData.price));
  // const show = 630550.20123;
  odometer.innerHTML = usdRewardsDistributed;
}, 2000);

window.odometerOptions = {
  auto: false, // Don't automatically initialize everything with class 'odometer'
  selector: '.my-numbers', // Change the selector used to automatically find things to be animated
  format: '(,ddd).dd', // Change how digit groups are formatted, and how many digits are shown after the decimal point
  duration: 3000, // Change how long the javascript expects the CSS animation to take
};
