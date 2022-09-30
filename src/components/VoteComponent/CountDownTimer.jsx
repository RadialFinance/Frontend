import { useEffect, useRef, useState } from "react";

export default function CountDownTimer(props) {
  //COUNTDOWN
  const [timerDays, setTimerDays] = useState("00");
  const [timerHours, setTimerHours] = useState("00");
  const [timerMinutes, setTimerMinutes] = useState("00");
  const [timerSeconds, setTimerSeconds] = useState("00");
  

  let interval = useRef();

  const startTimer = () => {
    const countdownDate = new Date(props.countDownDate).getTime();
    interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = countdownDate - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (distance < 0) {
        // Stop
        clearInterval(interval);
      } else {
        // Update
        setTimerDays(days.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}));
        setTimerHours(hours.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}));
        setTimerMinutes(minutes.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}));
        setTimerSeconds(seconds.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}));
      }
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line
  },[props.countDownDate]);

  return (
    <div>{timerDays}:{timerHours}:{timerMinutes}:{timerSeconds}</div>
  )
};