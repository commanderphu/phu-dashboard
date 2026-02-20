import { useLocalStorage } from "./useLocalStorage";

export function useWidgetOrder(defaultOrder: string[]): [string[], (order: string[]) => void] {
  const [savedOrder, setSavedOrder] = useLocalStorage<string[]>("phu:widget:order", defaultOrder);

  // Neue IDs (die in defaultOrder sind, aber nicht in savedOrder) ans Ende anhängen
  const newIds = defaultOrder.filter((id) => !savedOrder.includes(id));
  const order = newIds.length > 0 ? [...savedOrder, ...newIds] : savedOrder;

  return [order, setSavedOrder];
}
