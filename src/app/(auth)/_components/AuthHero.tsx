import { useTheme } from "next-themes";

export default function AuthHero() {
  const { theme } = useTheme();

  const backgroundColor =
    theme === "dark"
      ? "bg-gradient-to-br from-gray-950 via-purple-950 to-violet-950"
      : "bg-gray-100";
  const textColor = theme === "dark" ? "text-violet-100" : "text-gray-800";
  const secondaryTextColor =
    theme === "dark" ? "text-violet-200" : "text-gray-600";

  return (
    <div
      className={`hidden w-3/5 flex-col justify-between ${backgroundColor} p-12 lg:flex`}
    >
      <div className={`absolute inset-0 ${backgroundColor}`}>
        <div className="absolute inset-0 bg-[linear-gradient(30deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.05)_100%)]" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-around">
        <div className="space-y-2">
          <h2 className={`text-2xl font-semibold ${textColor}`}>
            Learn at Your Pace
          </h2>
          <p className={`${secondaryTextColor}`}>
            Flexible learning paths adapted to your schedule and preferences
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-8 w-8 rounded-full border-2 border-white bg-[url('/avatars/avatar${i}.jpg')] bg-cover bg-center`}
              />
            ))}
          </div>
          <p className={`text-sm ${secondaryTextColor}`}>
            Join students already learning with us
          </p>
        </div>
      </div>
    </div>
  );
}
