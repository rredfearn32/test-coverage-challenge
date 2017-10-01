// My approach involves refactoring the JSON input so that instead of having just string file paths,
// we should have a proper JSON object which holds information about each distinct directory in the file
// paths given.

var app = app ||
{
  jsonFileInput: null,

  getFromURL: function(inputJSON, callback)
  {
    $.get(inputJSON, function(data){
      var retrievedJSON = data.result;
      if(typeof retrievedJSON === "object")
        retrievedJSON = JSON.stringify(data.result);

      callback(retrievedJSON);
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

      reader.onload = function(ev)
      {
        app.jsonFileInput = ev.target.result;
      }

      reader.readAsText(app.jsonFileInput);
    }
  },

  convertInputJSONToTreeStructure: function(inputJSON)
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
          // If this object/level doesn't have a record of this value, create one
          // and give it a blank object as its contents
          if(thisLevel[filePathPartsArray[i]] == null)
          {
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
            thisLevel[filePathPartsArray[i]].coverage.coveredLines += inputJSON[filePathString].coveredLines;
            thisLevel[filePathPartsArray[i]].coverage.totalLines += inputJSON[filePathString].totalLines;
          }

          // Then move down into this level and repeat the loop
          thisLevel = thisLevel[filePathPartsArray[i]].contents;
        }
      }
    }

    return result;
  },

  displayError: function(error, method)
  {
    var errorHTML = "<div class='error'>"
                    + "Oops, the following error occurred: \n" + error
                  + "</div>";
    $(errorHTML).insertBefore("a[data-case='" + method + "']");
  },

  renderResults: function(jsonToRender, method)
  {
    var outputJSON;
    try
    {
      outputJSON = JSON.parse(jsonToRender);
    }
    catch(e)
    {
      app.displayError(e.message, method);
    }

    // Start rendering json
    var outputHTML;

    // Continue here

    $("#result-container").html(outputHTML);
  },

  startEventListeners: function()
  {
    // There are no proper link tags on the page, but there are some
    // masquerading as buttons, so stop all links going to their actual target.
    $("a").on("click", function(event){
      event.preventDefault();
      return false;
    });

    // Handle file upload
    if(Modernizr.filereader && Modernizr.blobconstructor)
    {
      $("#mock-file-input").on("click", function(event){
        $("#file-input").trigger("click");
      });

      $("#file-input").on("change", function(event){
        app.readFileAsString(event);
      });
    }

    $(".submit").on("click", function(event){
      $(event.target).siblings(".error").remove();
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
