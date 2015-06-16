|||challenge
Using Javascript again, we want you to create a game that meets the following criteria.

1. At least 4 walls.
1. When you play the game, you need to have achieved a score of at least **10** when you reach the goal.

**Hint:** you will need some extra energy stores in the game to get the score.

When you have played and finished the games, press the button.

{Check It!!|custom}(js-5)
|||


|||guidance
## Solution

The ordering of the various "Add" blocks is not essential, as long as they come after `Create Empty Maze`. The solution will need to include enough energy stores to increase the score to meet the requirement when the goal is reached.

```javascript
createEmptyMaze()
addRandomWalls(4)
addRandomEnergies(10)
addPlayer()
addGoal()
```