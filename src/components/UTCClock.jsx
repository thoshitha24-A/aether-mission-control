import { useNow } from '../context/TimeContext';
import { fmtUTC } from '../utils/format';

export function UTCClock({ className = '' }) {
  const now = useNow();
  return <time className={'num ' + className} dateTime={new Date(now).toISOString()}>{fmtUTC(new Date(now))}</time>;
}
