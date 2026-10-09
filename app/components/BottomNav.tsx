/**
 * The old bottom navigation is intentionally disabled.
 * Main navigation is now rendered globally by app/components/TopNav.tsx.
 * Keep this component temporarily so existing page imports remain valid
 * while the rest of the UI is migrated incrementally.
 */
export default function BottomNav() {
  return null;
}
