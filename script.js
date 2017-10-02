// My approach involves refactoring the JSON input so that instead of having just string file paths,
// we should have a proper JSON object which holds information about each distinct directory in the file
// paths given.

// Once that JSON object has been constructed, we can then loop through its properties to output the data.

var app = app ||
{
  // Holds raw text input from uploaded file
  jsonFileInput: null,

  // GET JSON from url provided
  getFromURL: function(inputJSON, callback)
  {
    $.get(inputJSON, function(data){
      if(data.result)
      {
        var retrievedJSON = data.result;
        // Data must be a string at this stage, so convert an object if that is returned
        if(typeof retrievedJSON === "object")
          retrievedJSON = JSON.stringify(data.result);

        // Do the callback with the retried data
        callback(retrievedJSON);
      }
      else
      {
        app.displayError("The returned data was not in the right format. Please ensure the API call returns a 'data' object with a 'results' property containing the JSON as either an object or a string", "api")
      }
    }).fail(function(data){
      app.displayError(data.statusText, "api")
    });
  },

  readFileAsString: function(event)
  {
    // Only on file should be being submitted, so let's just get that one
    app.jsonFileInput = event.target.files[0];

    // Only allow .txt, .json or .js files
    if(app.jsonFileInput.type === "application/javascript" ||
        app.jsonFileInput.type === "text/plain" ||
        app.jsonFileInput .type === "application/json")
    {
      $("#mock-file-input").text(app.jsonFileInput.name);

      var reader = new FileReader();

      // Once the file is read, save the contents to a variable
      reader.onload = function(ev)
      {
        app.jsonFileInput = ev.target.result;
      }

      // Try to read the file
      try
      {
        reader.readAsText(app.jsonFileInput);
      }
      catch(err)
      {
        app.displayError(err, "file")
      }
    }
    else
    {
      app.displayError("File must be either .js, .json or .txt format", "file")
    }
  },

  convertInputJSONToTreeStructure: function(inputJSON, method)
  {
    // Variables to be used in the convertInputJSONToTreeStructure function
    var filePathPartsArray;
    var filePathString;
    var thisLevel;
    var result = {};

    // Now, let's loop through the mockJSON object's top-level objects (the file paths)
    for (filePathString in inputJSON)
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
          if(inputJSON[filePathString].coveredLines != undefined && inputJSON[filePathString].totalLines != undefined)
          {
            if(thisLevel[filePathPartsArray[i]] == null)
            {
              // If this object/level doesn't have a record of this value, create one
              // and give it an empty object as its contents and set the intial coverage values
              thisLevel[filePathPartsArray[i]] = {
                "coverage": {
                  "coveredLines": inputJSON[filePathString].coveredLines,
                  "totalLines": inputJSON[filePathString].totalLines,
                },
                "contents": {}
              };
            }
            else
            {
              // Otherwise, if this object/level does have a record,
              // add the coverage values of this object
              thisLevel[filePathPartsArray[i]].coverage.coveredLines += inputJSON[filePathString].coveredLines;
              thisLevel[filePathPartsArray[i]].coverage.totalLines += inputJSON[filePathString].totalLines;
            }

            // Then move down into this level and repeat the loop
            thisLevel = thisLevel[filePathPartsArray[i]].contents;
          }
          else
          {
            app.displayError("JSON is not in the correct format", method)
          }

        }
      }
    }

    return result;
  },

  displayError: function(error, method)
  {
    // If the right variables are passed in...
    if(typeof error == "string" && error.length > 0 && typeof method == "string" && method.length)
    {
      // Show the error...
      var errorHTML = "<div class='error'>"
                        + "Error occurred: \n" + error
                      + "</div>";
      // In the relevant form section
      $(errorHTML).insertBefore("a[data-case='" + method + "']");
    }
  },

  renderResults: function(jsonToRender, method)
  {
    // Ensure the jsonToRender is a string at this point
    if(typeof jsonToRender != "string")
    {
      app.displayError("Your JSON is not a string as expected", method);
      return false;
    }

    var outputJSON;

    // jsonToRender should be a string at this point, so let's change that to an object
    try
    {
      outputJSON = JSON.parse(jsonToRender);
    }
    catch(e)
    {
      app.displayError(e.message, method);
      return;
    }

    // Conver the input JSON (which is just file path strigs and coverage data) to
    // an actual JSON tree structure
    outputJSON = app.convertInputJSONToTreeStructure(outputJSON, method);

    // Generate the html to output from the outputJSON
    var outputHTML = app.reccursiveReadOfObject(outputJSON);
    $("#result-container").html(outputHTML);
  },

  reccursiveReadOfObject: function(outputJSON)
  {
    // Reccursively loop through the converted JSON object so we can print out the data

    var currentItem;
    var curentItemCoverageString;
    var outputHTML = "<ul>";

    for(item in outputJSON)
    {
      currentItem = outputJSON[item];

      // Ensure JSON item has all required properties
      if(currentItem.coverage && currentItem.coverage.coveredLines && currentItem.coverage.totalLines)
      {
        // Create the coverage stats html
        currentItemCoverageString = currentItem.coverage.coveredLines
        + "/"
        + currentItem.coverage.totalLines
        + " ("
        + ((currentItem.coverage.coveredLines / currentItem.coverage.totalLines) * 100).toFixed(2)
        + "%)";

        // Start creating this new line of output for this file/directory
        outputHTML += "<li>"
        + "<div class='title'>"
          + "<span class='name'>"
            + item
          + "</span>"
          + "<span class='coverage'>"
            + currentItemCoverageString
          + "</span>"
        + "</div>";

        if(currentItem.contents)
        {
          // Call the function Reccursively to drill down to the next level and repeat the process.
          // If we get to a file, its contents will be empty and thus won't be passed through the containing for loop
          outputHTML += app.reccursiveReadOfObject(currentItem.contents);
        }

        outputHTML += "</li>"
      }
    }

    outputHTML += "</ul>";

    return outputHTML;
  },

  startEventListeners: function()
  {
    // All the link tags on the page are just
    // masquerading as buttons, so stop all links going to their actual target.
    $("a").on("click", function(event){
      event.preventDefault();
      return false;
    });

    // Handle file upload, using the link as a fake button...
    if(Modernizr.filereader && Modernizr.blobconstructor)
    {
      // ...Which triggers a click on the real hidden file upload button
      $("#mock-file-input").on("click", function(event){
        $("#file-input").trigger("click");
      });

      // When the user selects a file, start reading it in
      $("#file-input").on("change", function(event){
        app.readFileAsString(event);
      });
    }

    // Handle the submit buttons
    $(".submit").on("click", function(event){
      // Remove all error messages
      $(".error").remove();
      var method = $(event.target).attr("data-case");
      var inputJSON;

      switch(method)
      {
        case "direct":
          inputJSON = $("#copy-paste-input").val();
          if(inputJSON.length > 0)
            app.renderResults(inputJSON, method);
          break;
        case "file":
          inputJSON = app.jsonFileInput;
          if(inputJSON && inputJSON.length > 0)
            app.renderResults(inputJSON, method);
          break;
        case "api":
          inputJSON = $("#api-input").val();
          if(inputJSON.length > 0)
          {
            app.getFromURL(inputJSON, function(inputJSON){
              app.renderResults(inputJSON, "api");
            });
          }
          break;
      }
    });
  },

  init: function()
  {
    app.startEventListeners();
  }
};

app.init();
