"use client";

import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="input w-[120px] py-2"
    >
      <option value="light">light</option>
      <option value="dark">dark</option>
      <option value="system">system</option>
    </select>
  );
}