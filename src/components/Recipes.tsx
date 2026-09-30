import { useMemo, useState } from "react";
import { Browse } from "@/components/browse";
import { ClassicsList } from "@/components/classics-list";
import { RecipeDetail } from "@/components/recipe-detail";
import { RecipeShelf } from "@/components/recipe-shelf";
import { RECIPES } from "@/data/recipes";
import { matchAll, type RecipeMatch } from "@/lib/match";
import { frontPicks } from "@/lib/recipe-filters";
import { useClassics } from "@/lib/use-classics";
import type { GroceryItem, Staple } from "@/types";

type Section = "recommended" | "classics" | "wishlist";
type View = { kind: "home" } | { kind: "browse" } | { kind: "recipe"; id: string };

const SECTIONS: { id: Section; label: string }[] = [
  { id: "recommended", label: "Recommended" },
  { id: "classics", label: "Classics" },
  { id: "wishlist", label: "Wishlist" },
];

interface Props {
  groceries: GroceryItem[];
  staples: Staple[];
  onCooked: (usedIds: string[]) => void;
}

export function Recipes({ groceries, staples, onCooked }: Props) {
  const [section, setSection] = useState<Section>("recommended");
  const [view, setView] = useState<View>({ kind: "home" });
  const { classics, like, wish } = useClassics();
  const matches = useMemo(() => matchAll(RECIPES, groceries, staples), [groceries, staples]);

  function go(next: View) {
    setView(next);
    window.scrollTo(0, 0);
  }
  const home = () => go({ kind: "home" });
  const open = (id: string) => go({ kind: "recipe", id });
  const pick = (ids: string[]) => ids.flatMap((id) => matches.find((m) => m.recipe.id === id) ?? []);

  const detail = view.kind === "recipe" ? matches.find((m) => m.recipe.id === view.id) : undefined;
  if (detail) {
    const { recipe } = detail;
    return (
      <RecipeDetail
        match={detail}
        liked={classics.liked.includes(recipe.id)}
        wished={classics.wish.includes(recipe.id)}
        onBack={home}
        onLike={() => like(recipe.id)}
        onWish={() => wish(recipe.id)}
        onCooked={onCooked}
      />
    );
  }
  if (view.kind === "browse") return <Browse matches={matches} onOpen={open} onBack={home} />;

  return (
    <section>
      <div className="filters" role="tablist" aria-label="Recipe sections">
        {SECTIONS.map((s) => (
          <button key={s.id} role="tab" aria-selected={section === s.id} className={`pill ${section === s.id ? "on" : ""}`} onClick={() => setSection(s.id)}>
            {s.label}
          </button>
        ))}
      </div>
      {section === "recommended" && <Recommended matches={matches} onOpen={open} onBrowse={() => go({ kind: "browse" })} />}
      {section === "classics" && <ClassicsList kind="liked" matches={pick(classics.liked)} onOpen={open} onLike={like} onRemove={like} />}
      {section === "wishlist" && <ClassicsList kind="wish" matches={pick(classics.wish)} onOpen={open} onLike={like} onRemove={wish} />}
    </section>
  );
}

interface RecommendedProps {
  matches: RecipeMatch[];
  onOpen: (id: string) => void;
  onBrowse: () => void;
}

function Recommended({ matches, onOpen, onBrowse }: RecommendedProps) {
  const ranked = matches.filter((m) => m.usesGroceries.length > 0);
  if (ranked.length === 0) {
    return (
      <>
        <p className="empty">
          Add a few groceries in the <strong>Pantry</strong> tab and Sous will suggest what to cook.
        </p>
        <button onClick={onBrowse}>Browse all recipes</button>
      </>
    );
  }
  const readyCount = ranked.filter((m) => m.missing.length === 0).length;
  return (
    <>
      <p className="intro">
        {readyCount > 0 ? (
          <>
            You can make <strong>{readyCount}</strong> {readyCount === 1 ? "recipe" : "recipes"} right now.
          </>
        ) : (
          <>Nothing's fully ready yet — here's what you're closest to.</>
        )}{" "}
        Food that's about to expire comes first.
      </p>
      <RecipeShelf picks={frontPicks(ranked)} onOpen={onOpen} onBrowse={onBrowse} />
    </>
  );
}
