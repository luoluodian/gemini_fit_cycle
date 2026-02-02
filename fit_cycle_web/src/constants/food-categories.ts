import { FoodCategory } from "../types/food-constants";

export interface FoodCategoryConfig {
  key: FoodCategory;
  label: string;
  emoji: string;
  theme: {
    bg: string;
    text: string;
    border: string;
    activeBg: string;
    activeText: string;
    activeBorder: string;
    ring: string;
  };
}

export const FOOD_CATEGORIES: FoodCategoryConfig[] = [
  {
    key: FoodCategory.PROTEIN,
    label: "蛋白质",
    emoji: "🥩",
    theme: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", activeBg: "bg-rose-100", activeText: "text-rose-700", activeBorder: "border-rose-300", ring: "ring-rose-300" }
  },
  {
    key: FoodCategory.VEGETABLES,
    label: "蔬菜",
    emoji: "🥬",
    theme: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200", activeBg: "bg-green-100", activeText: "text-green-700", activeBorder: "border-green-300", ring: "ring-green-300" }
  },
  {
    key: FoodCategory.FRUITS,
    label: "水果",
    emoji: "🍎",
    theme: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", activeBg: "bg-amber-100", activeText: "text-amber-700", activeBorder: "border-amber-300", ring: "ring-amber-300" }
  },
  {
    key: FoodCategory.GRAINS,
    label: "谷物",
    emoji: "🌾",
    theme: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", activeBg: "bg-yellow-100", activeText: "text-yellow-800", activeBorder: "border-yellow-300", ring: "ring-yellow-300" }
  },
  {
    key: FoodCategory.DAIRY,
    label: "乳制品",
    emoji: "🥛",
    theme: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", activeBg: "bg-blue-100", activeText: "text-blue-700", activeBorder: "border-blue-300", ring: "ring-blue-300" }
  },
  {
    key: FoodCategory.NUTS,
    label: "坚果",
    emoji: "🥜",
    theme: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", activeBg: "bg-orange-100", activeText: "text-orange-700", activeBorder: "border-orange-300", ring: "ring-orange-300" }
  },
  {
    key: FoodCategory.OILS,
    label: "油脂",
    emoji: "🫒",
    theme: { bg: "bg-stone-50", text: "text-stone-600", border: "border-stone-200", activeBg: "bg-stone-100", activeText: "text-stone-700", activeBorder: "border-stone-300", ring: "ring-stone-300" }
  },
  {
    key: FoodCategory.SNACKS,
    label: "零食",
    emoji: "🍪",
    theme: { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-200", activeBg: "bg-pink-100", activeText: "text-pink-700", activeBorder: "border-pink-300", ring: "ring-pink-300" }
  },
  {
    key: FoodCategory.CUSTOM,
    label: "其他",
    emoji: "🥢",
    theme: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", activeBg: "bg-gray-100", activeText: "text-gray-700", activeBorder: "border-gray-300", ring: "ring-gray-300" }
  },
];

export const getFoodCategoryConfig = (key: string): FoodCategoryConfig => {
  return FOOD_CATEGORIES.find(c => c.key === key) || FOOD_CATEGORIES[FOOD_CATEGORIES.length - 1];
};
