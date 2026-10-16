import { Stories } from "@/components/Stories";
import { nearestFriday } from "@/lib/friday";

// Дата ближайшей пятницы на экране заявки пересчитывается раз в час.
export const revalidate = 3600;

export default function Home() {
  return <Stories friday={nearestFriday()} />;
}
