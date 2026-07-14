// .storybook/reading-time-mock.ts

// Shape similar to the real `reading-time` return type
interface ReadingTimeResult {
  text: string;
  minutes: number;
  time: number;
  words: number;
}

interface ReadingTimeOptions {
  wordsPerMinute?: number;
}

// Default export to match `import readingTime from 'reading-time'`
export default function readingTime(
  text: string,
  opts?: ReadingTimeOptions
): ReadingTimeResult {
  const words = text ? text.trim().split(/\s+/).length : 0;
  const wpm = opts?.wordsPerMinute ?? 250;

  const minutes = words && wpm ? words / wpm : 0;
  const rounded = Math.max(1, Math.ceil(minutes || 1));

  return {
    text: `${rounded} min read`,
    minutes: minutes || 0,
    time: (minutes || 0) * 60 * 1000,
    words,
  };
}
