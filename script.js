// My approach involves refactoring the JSON input so that instead of having just string file paths,
// we should have a proper JSON object which holds information about each distinct directory in the file
// paths given.

// So, let's get started...

// We have our mock JSON input
var mockInputJSON = {
  "/Main.java":           {"coveredLines": 0,  "totalLines": 10},
  "/utils/Copy.java":     {"coveredLines": 15, "totalLines": 37},
  "/utils/Paste.java":    {"coveredLines": 14, "totalLines": 14},
  "/utils/nums/Add.java": {"coveredLines": 9,  "totalLines": 22},
  "/ui/Window.java":      {"coveredLines": 23, "totalLines": 79},
  "/something/totally/new/ui/Window.java":      {"coveredLines": 23, "totalLines": 79}
};

// Let's initialize the variables that will be needed later
var filePathPartsArray;
var filePathString;
var thisLevel;

// This is what we'll be packing everything into
var result = {};

// Now, let's loop through the mockJSON object's top-level objects (the file paths)
for (filePathString in mockInputJSON)
{
  // Split the file path on its '/' character to get the individual elements
  filePathPartsArray = filePathString.split("/");

  // Now, from here down, I got some help from:
  // https://stackoverflow.com/questions/36248245/how-to-convert-an-array-of-paths-into-json-structure

  // Set the intial level to be the top
  thisLevel = result;

  // For each of the file path segments
  for(var i=0; i<filePathPartsArray.length; i++)
  {
    // For segments that have an actual value
    if(filePathPartsArray[i].length > 0)
    {
      // If this object/level doesn't have a record of this value, create one
      // and give it a blank object as its contents
      if(thisLevel[filePathPartsArray[i]] == null)
      {
        thisLevel[filePathPartsArray[i]] = {
          "coverage": {
            "coveredLines": mockInputJSON[filePathString].coveredLines,
            "totalLines": mockInputJSON[filePathString].totalLines,
          },
          "contents": {

          }
        };
      }
      else
      {
        thisLevel[filePathPartsArray[i]].coverage.coveredLines += mockInputJSON[filePathString].coveredLines;
        thisLevel[filePathPartsArray[i]].coverage.totalLines += mockInputJSON[filePathString].totalLines;
      }

      // Then move down into this level and repeat the loop
      thisLevel = thisLevel[filePathPartsArray[i]].contents;
    }
  }
}

console.log(result);
