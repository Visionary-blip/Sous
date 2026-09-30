import { RecipePage } from "@/components/recipe-page";
import type { RecipeMatch } from "@/lib/match";
import type { useClassics } from "@/lib/use-classics";
import type { useCooking } from "@/lib/use-cooking";

interface Props {
  match: RecipeMatch;
  classics: ReturnType<typeof useClassics>;
  cook: ReturnType<typeof useCooking>;
  onBack: () => void;
  onComplete: (match: RecipeMatch) => void;
}

/** Binds one recipe's page to the shared Classics and cooking state. */
export function RecipeScreen({ match, classics, cook, onBack, onComplete }: Props) {
  const { id } = match.recipe;
  return (
    <RecipePage
      match={match}
      liked={classics.classics.liked.includes(id)}
      wished={classics.classics.wish.includes(id)}
      cookingStep={cook.cooking?.id === id ? cook.cooking.step : null}
      onBack={onBack}
      onLike={() => classics.like(id)}
      onWish={() => classics.wish(id)}
      onJump={(step) => cook.jump(id, step)}
      onComplete={onComplete}
    />
  );
}
