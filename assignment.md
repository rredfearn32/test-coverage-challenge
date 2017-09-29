# Test coverage challenge

Our software produces unit tests, and an important metric for unit tests is [test coverage](https://en.wikipedia.org/wiki/Code_coverage).
Coverage is a measure of how much source code is executed by tests; we measure coverage by line.

We would like you to produce a web page which uses a JSON file as a data source to render test coverage
for a set of files. We would also like to see a sum of coverage for each directory.

The JSON file has the format:
```json
{
  "/Main.java":           {"coveredLines": 0,  "totalLines": 10},
  "/utils/Copy.java":     {"coveredLines": 15, "totalLines": 37},
  "/utils/Paste.java":    {"coveredLines": 14, "totalLines": 14},
  "/utils/nums/Add.java": {"coveredLines": 9,  "totalLines": 22},
  "/ui/Window.java":      {"coveredLines": 23, "totalLines": 79}
}
```

Where each key is the file path & name, each "coveredLines" value is the number of lines covered by tests,
and each "totalLines" value is the number of lines of code in the file.

## Time frame

We would like you to spend roughly 4 hours working on this.
We recognise this is an ambitious task, don't worry if you can't finish it.
Focus on what you think would be most important to the user.

## Requirements

- The page should load an external JSON file by some means
- The page should display coverage in some way for each file
- The page should also display total coverage for each directory and subdirectory
- Use git and upload the project to Github

## Considerations

- Be sensible about the framework and/or tools that you choose, learning a entirely new stack may not be the best choice
- Imagine different scenarios for the user, what information would be most helpful? Can you use visual elements to improve their experience?
- Document the project: set up, known bugs, unfinished features, future ideas
- Follow accessibility and usability best practices
- Consider writing unit or integration tests
- Try to make it perform well with a larger data source, such as [this example](https://gist.github.com/peterjwest/f1ecf6862142202b4fcf5ceb17ea11b2)
- There's no design, so imagine the design will be applied later. You may wish to use a CSS framework to provide a layout and base styles.
