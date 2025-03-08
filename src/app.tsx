import React from "react";

export function App() {
  const [isDark, setIsDark] = React.useState(false);
  const darkId = React.useId();

  React.useEffect(() => {
    const body = document.body;
    if (body.classList.contains("dark") != isDark) {
      body.classList.toggle("dark");
    }
  }, [isDark]);

  return (
    <div className="w-2xl mx-auto mt-4 shadow-xl">
      <h1 className="text-3xl font-medium m-4">ATC</h1>
      <div>
        <label htmlFor={darkId}>Dark mode</label>
        <input
          id={darkId}
          type="checkbox"
          checked={isDark}
          onChange={() => setIsDark(!isDark)}
        />
      </div>
    </div>
  );
}
