import DigitalClock from "./DigitalClock";

export const Header = () => (
  <header className="flex  justify-between items-center mb-8 text-white flex-wrap">
    <div>
      <h1 className="text-3xl font-bold">Meeting Dashboard</h1>
    </div>
    <p className="text-sm text-gray-200">
      <DigitalClock />
    </p>
    <div>
      <p className="text-lg font-semibold"></p>
    </div>
  </header>
);
