

try {
  var data = require('/home/codio/workspace/stack.json');
  
  if(data.wallCount == 4 && data.score > 10) {
    process.stdout.write('Well done!');  
    process.exit(0);
  }
}
catch(e) {
//   console.log(e);
}

process.stdout.write('Not quite right, try again!');  
process.exit(1);
