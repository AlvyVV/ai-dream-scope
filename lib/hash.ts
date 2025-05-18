import { SnowflakeIdv1 } from 'simple-flakeid';
import { v4 as uuidv4 } from 'uuid';

export function getUuid(): string {
  return uuidv4();
}

export function getUniSeq(prefix: string = ''): string {
  if (typeof window === 'undefined') {
    return `${prefix}${uuidv4().substring(0, 8)}`;
  }

  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);

  return `${prefix}${randomPart}${timestamp}`;
}

export function getNonceStr(length: number): string {
  if (typeof window === 'undefined') {
    const randomStr = uuidv4().replace(/-/g, '');
    return randomStr.substring(0, length);
  }

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters[randomIndex];
  }

  return result;
}

export function getSnowId(): string {
  const gen = new SnowflakeIdv1({ workerId: 1 });
  const snowId = gen.NextId();

  return snowId.toString();
}
