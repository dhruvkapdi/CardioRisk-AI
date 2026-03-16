import { usePrediction } from "@/hooks/use-prediction";
import { HistoryPage } from "@/components/HistoryPage";

export default function HistoryRoute() {
  const { history, clearHistory } = usePrediction();
  return <HistoryPage history={history} onClear={clearHistory} />;
}
