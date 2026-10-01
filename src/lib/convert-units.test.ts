import { describe, expect, it } from "vitest";
import { convertUnits } from "@/lib/convert-units";

describe("convertUnits to metric", () => {
  it("turns cups, spoons, ounces and pounds into ml and g", () => {
    expect(convertUnits("1 cup flour", "metric")).toBe("240 ml flour");
    expect(convertUnits("2 tbsp oil", "metric")).toBe("30 ml oil");
    expect(convertUnits("1 1/2 tsp salt", "metric")).toBe("8 ml salt");
    expect(convertUnits("8 oz cheddar", "metric")).toBe("225 g cheddar");
    expect(convertUnits("2 lbs chicken", "metric")).toBe("905 g chicken");
    expect(convertUnits("5 cups stock", "metric")).toBe("1.2 l stock");
  });

  it("reads fractions, unicode fractions and ranges", () => {
    expect(convertUnits("½ cup milk", "metric")).toBe("120 ml milk");
    expect(convertUnits("1-2 tbsp honey", "metric")).toBe("15-30 ml honey");
  });
});

describe("convertUnits to US", () => {
  it("turns ml and g into cups, spoons, ounces and pounds", () => {
    expect(convertUnits("300ml milk", "us")).toBe("1 1/4 cups milk");
    expect(convertUnits("100g plain flour", "us")).toBe("3 1/2 oz plain flour");
    expect(convertUnits("750g lean beef mince", "us")).toBe("1 3/4 lb lean beef mince");
    expect(convertUnits("10 ml oil", "us")).toBe("2 tsp oil");
  });
});

describe("temperatures", () => {
  it("converts Celsius and Fahrenheit, with or without a degree mark", () => {
    expect(convertUnits("Heat the oven to 180C.", "us")).toBe("Heat the oven to 180C.".replace("180C", "355F"));
    expect(convertUnits("Bake at 350°F", "metric")).toBe("Bake at 175°C");
  });

  it("leaves a temperature already in the target system", () => {
    expect(convertUnits("Bake at 350°F", "us")).toBe("Bake at 350°F");
  });
});

describe("what it leaves alone", () => {
  it("skips text already in the target system, counts, and lines giving both systems", () => {
    expect(convertUnits("100g flour", "metric")).toBe("100g flour");
    expect(convertUnits("2 large eggs", "us")).toBe("2 large eggs");
    expect(convertUnits("1 cup (240ml) milk", "metric")).toBe("1 cup (240ml) milk");
    expect(convertUnits("a pinch of salt", "us")).toBe("a pinch of salt");
  });
});
