Here are the Javascript function names available to you

- `createEmptyMaze()`
- `addPlayer()`
- `addGoal()`
- `addWall()`
- `addEnergy()`
- `addMonster()`

|||challenge
It's the same challenge as before, so

- create an empty maze
- add 1 wall at (2,2) 
- add 1 monsters at (6,5)
- add 2 energy stores at (5,3) and (7, 4)
- add the player
- add the goal

Don't forget to add the 'Create Empty Maze' as the first instruction.

Press the button below once you think you've done it.

{Check it!! | custom}(js-4)

|||

|||guidance
## Solution

The ordering of the various "Add" blocks is not essential, as long as they come after `Create Empty Maze`.

```javascript
createEmptyMaze()
addWall(2, 2)
addMonster(6, 5)
addEnergy(5, 3)
addEnergy(7, 4)
addPlayer()
addGoal()
```