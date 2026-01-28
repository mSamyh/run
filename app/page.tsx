import { HomeDashboard } from "../components/HomeDashboard";
import { AuthGate } from "../components/AuthGate";

export default function HomePage() {
  return (
    <AuthGate>
      <HomeDashboard />
    </AuthGate>
  );
}


