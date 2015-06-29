# Contributing to SparkPost

Transparency is one of our core values, and we encourage developers to contribute and become part of the SparkPost developer community.

## Prerequisite to contribution

Before writing code, please search for existing issues or [create a new issue](docs/ADDING_ISSUES.markdown) to confirm where your contribution fits into the roadmap.

Current milestone Pull Requests will receive priority review for merging.

## Contribution Steps
1. Fork this repository
2. Create a new branch named after the issue you’ll be fixing (include the issue number as the branch name, example: Issue in GH is #8 then the branch name should be ISSUE-8)) 
3. Make sure to run the Grunt commands to validate your changes
    * Run tests using ```grunt``` OR ```grunt test <file>```
5. Ensure validation passes
6. Compile the final version (which also runs a validation pass against the concatenated Apiary file)
6. Submit a new Pull Request applying your feature/fix branch to the develop branch of this repository
