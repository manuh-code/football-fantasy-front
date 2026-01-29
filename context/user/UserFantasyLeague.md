# User Fantasy League Route and Component Setup

## Route Configuration
1. Create a route named `userFantasyLeague`.
2. Set the `meta` property `requiresAuth` to `true`.
3. Assign the route to the `UserFantasyLeagueView`.

## UserFantasyLeagueView
- Use the `PageHeader` component for the page header.
- Include the `UserFantasyLeagueComponent` in the view.

## UserFantasyLeagueComponent
1. Utilize the `useUserStore` to access the user's fantasy leagues.
2. Use the getter `getUserFantasyLeagues()` to retrieve the fantasy leagues.
3. If the getter returns `null`, call the action `getUserFantasyLeaguesFromApi()` and then retrieve the fantasy leagues using the getter `getUserFantasyLeagues()` again.
4. The getter will return an array of fantasy leagues, which follows the `FantasyLeaguesResponse[]` interface.

## Displaying Fantasy Leagues
- Render the user's fantasy leagues in the `UserFantasyLeagueComponent`.

## Styling and Reusability
- Follow the project's styling guidelines using Tailwind CSS.
- Reuse existing UI components wherever possible.
