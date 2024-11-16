import MarketingNav from "./MarketingNav";

export default async function MarketingNavBarWrapper() {
  return (
    <header className="h-20 w-full">
      <div className="container h-full">
        <MarketingNav />
      </div>
    </header>
  );
}
