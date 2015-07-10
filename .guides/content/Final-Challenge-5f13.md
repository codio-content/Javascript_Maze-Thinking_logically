
Here are the JavaScript function names available to you

- `createEmptyMaze()`
- `addPlayer()`
- `addGoal()`
- `addWall()`
- `addEnergy()`
- `addMonster()`

|||challenge
Using Javascript again, we want you to create a game that meets the following criteria.

1. At least 4 walls.
1. You must play the game and achieved a score of at least **10** when you reach the goal.

**Hint:** you will need some extra energy stores in the game to get the score.

When you have played the game and reached the goal press the 'Check It' button. Checking your solution without playing the game and reaching the goal will fail the challenge.

{Check It!!|custom}(js-5)
|||


|||guidance
## Solution

The ordering of the various "Add" functions is not essential, as long as they come after `createEmptyMaze`. The solution will need to include enough energy stores to increase the score to meet the requirement when the goal is reached.

```javascript
createEmptyMaze()
addWall()
addWall()
addWall()
addWall()
addEnergy()
addEnergy()
addEnergy()
addEnergy()
addEnergy()
addEnergy()
addEnergy()
addEnergy()
addEnergy()
addEnergy()
addPlayer()
addGoal()
```